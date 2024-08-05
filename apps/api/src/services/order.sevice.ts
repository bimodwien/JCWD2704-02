import { Request } from 'express';
import prisma from '@/prisma';
import sharp from 'sharp';
const midtransClient = require('midtrans-client');

class OrderService {
  async paymentProof(req: Request) {
    const { orderId } = req.params;
    const { file } = req;
    const userId = req.user.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId, paidType: 'manual' },
    });
    if (!order) throw new Error('order not found');

    let status = order.status;
    let paid_at = order.paidAt;

    if (file) {
      status = 'waitingConfirmation';
      paid_at = new Date();
      const buffer = await sharp(file.buffer).png().toBuffer();

      return await prisma.order.update({
        where: { id: orderId, userId: userId },
        data: { paymentProof: buffer, status, paidAt: paid_at },
      });
    }
  }

  async renderProof(req: Request) {
    const data = await prisma.order.findUnique({
      where: {
        id: req.params.id,
      },
    });
    return data?.paymentProof;
  }

  async cancelByUser(req: Request) {
    const { orderId } = req.params;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new Error('user not found');

    const order = await prisma.order.findUnique({
      where: { id: orderId, userId: userId },
    });

    if (!order) throw new Error('order not found');

    if (order.status !== 'waitingPayment') {
      throw new Error('order cannot be cancelled');
    }

    if (
      order.paidType === 'manual' ||
      (order.paidType === 'gateway' && !order.payment_method)
    ) {
      const cancel = await prisma.$transaction(async (prisma) => {
        const updatedOrder = await prisma.order.update({
          where: { id: orderId, userId: userId },
          data: {
            status: 'cancelled',
            cancelledAt: new Date(),
            cancelledBy: 'user',
          },
        });

        const orderItems = await prisma.orderItem.findMany({
          where: { orderId: orderId },
        });

        for (const item of orderItems) {
          const updatedStock = await prisma.stock.update({
            where: {
              productId_storeId: {
                productId: item.productId,
                storeId: updatedOrder.storeId,
              },
            },
            data: {
              quantity: { increment: item.quantity },
            },
          });

          const stock = await prisma.stock.findUnique({
            where: {
              productId_storeId: {
                productId: item.productId,
                storeId: updatedOrder.storeId,
              },
            },
          });

          if (stock) {
            await prisma.stockHistory.create({
              data: {
                quantityChange: item.quantity,
                reason: 'orderCancellation',
                changeType: 'in',
                productId: item.productId,
                stockId: stock.id,
                storeId: updatedOrder.storeId,
                orderId: updatedOrder.id,
              },
            });
          } else {
            throw new Error(
              `stock not found for product ${item.productId} and store ${updatedOrder.storeId}`,
            );
          }
        }

        return updatedOrder;
      });

      return cancel;
    } else if (
      order.paidType === 'gateway' &&
      order.payment_method &&
      !order.paidAt
    ) {
      try {
        const coreApi = new midtransClient.CoreApi({
          isProduction: false,
          serverKey: process.env.SERVER_KEY,
          clientKey: process.env.CLIENT_KEY,
        });

        await coreApi.transaction.cancel(order.invoice);

        const cancelledOrder = await prisma.order.update({
          where: { id: orderId, userId: userId },
          data: {
            cancelledBy: 'user',
          },
        });

        console.log(
          `cancellation request sent to midtrans for ${order.invoice}`,
        );

        return cancelledOrder;
      } catch (error) {
        throw new Error('error while cancelling order with midtrans');
      }
    }

    throw new Error('cancellation criteria not met');
  }

  async confirmOrder(req: Request) {
    const userId = req.user.id;
    const { orderId } = req.params;

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: userId },
    });
    if (!order) throw new Error('Order not found');

    if (order.status !== 'shipped')
      throw new Error('Cannot confirm this order');

    const currentDate = new Date();
    const shippedAt = new Date(order.shippedAt as Date);
    const diffTime = Math.abs(currentDate.getTime() - shippedAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 7) {
      throw new Error('Confirmation period has expired');
    }

    const confirm = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'confirmed',
        confirmedAt: new Date(),
        confirmedBy: 'user',
      },
    });

    return confirm;
  }
}

export default new OrderService();
