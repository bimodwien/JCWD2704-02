import { Request } from 'express';
import prisma from '@/prisma';
import crypto from 'crypto';
import sharp from 'sharp';
const midtransClient = require('midtrans-client');

class OrderService {
  async getByUser(req: Request) {
    const { userId } = req.params;
    const order = await prisma.order.findMany({
      where: { userId: userId },
    });
    if (!order) throw new Error('Order empty');
    return order;
  }

  async getDetail(req: Request) {
    const { invoice } = req.params;
    const detail = await prisma.order.findUnique({
      where: { invoice: invoice },
      include: {
        OrderItem: {
          include: {
            product: { include: { ProductImage: { select: { id: true } } } },
          },
        },
        address: true,
      },
    });
    if (!detail) throw new Error('Order not found');
    return detail;
  }

  async paymentProof(req: Request) {
    const { orderId } = req.params;
    const { file } = req;
    const userId = 'clz5p3y8f0000ldvnbx966ss6';

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
    const userId = 'clz5p3y8f0000ldvnbx966ss6';

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

  async updateByMidtrans(req: Request) {
    try {
      const data = req.body;

      if (!data || typeof data !== 'object') {
        throw new Error(
          'Invalid request data. Missing or invalid data object.',
        );
      }

      // console.log('Received data:', data);

      const order = await prisma.order.findUnique({
        where: {
          invoice: data.order_id,
        },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      const hash = crypto
        .createHash('sha512')
        .update(
          `${data.order_id}${data.status_code}${data.gross_amount}${process.env.SERVER_KEY}`,
        )
        .digest('hex');

      if (data.signature_key !== hash) {
        throw new Error('Invalid signature key');
      }

      let responData = null;
      let orderStatus = data.transaction_status;
      let fraudStatus = data.fraud_status;

      if (orderStatus === 'capture' && fraudStatus === 'accept') {
        const updatedOrder = await prisma.order.update({
          where: { invoice: data.order_id },
          data: {
            status: 'processed',
            payment_method: data.payment_type,
            paidAt: new Date(data.transaction_time),
            processedAt: new Date(data.transaction_time),
          },
        });
        responData = updatedOrder;
      } else if (orderStatus === 'settlement') {
        const updatedOrder = await prisma.order.update({
          where: { invoice: data.order_id },
          data: {
            status: 'processed',
            payment_method: data.payment_type,
            paidAt: new Date(data.transaction_time),
            processedAt: new Date(data.transaction_time),
          },
        });
        responData = updatedOrder;
      } else if (
        orderStatus === 'cancel' ||
        orderStatus === 'deny' ||
        orderStatus === 'expire'
      ) {
        try {
          const updatedOrder = await prisma.$transaction(async (prisma) => {
            const orderUpdate = await prisma.order.update({
              where: { invoice: data.order_id },
              data: { status: 'cancelled', cancelledAt: new Date() },
            });

            const orderItems = await prisma.orderItem.findMany({
              where: { orderId: orderUpdate.id },
            });

            for (const item of orderItems) {
              const updatedStock = await prisma.stock.update({
                where: {
                  productId_storeId: {
                    productId: item.productId,
                    storeId: orderUpdate.storeId,
                  },
                },
                data: {
                  quantity: { increment: item.quantity },
                },
              });

              if (updatedStock) {
                await prisma.stockHistory.create({
                  data: {
                    quantityChange: item.quantity,
                    reason: 'orderCancellation',
                    changeType: 'in',
                    productId: item.productId,
                    stockId: updatedStock.id,
                    storeId: orderUpdate.storeId,
                    orderId: orderUpdate.id,
                  },
                });
              } else {
                throw new Error(
                  `stock not found for product ${item.productId} and store ${orderUpdate.storeId}`,
                );
              }
            }

            return orderUpdate;
          });

          responData = updatedOrder;
        } catch (error) {
          console.error('error cancellation:', error);
          throw new Error('failed to cancel order and update stock');
        }
      } else if (orderStatus === 'pending') {
        const updatedOrder = await prisma.order.update({
          where: { invoice: data.order_id },
          data: {
            status: 'waitingPayment',
            payment_method: data.payment_type,
            expiry_time: new Date(data.expiry_time),
          },
        });
        responData = updatedOrder;
      }

      // console.log('Response data:', responData);

      return responData;
    } catch (error) {
      console.error('Error in updateByMidtrans:', error);
      throw error;
    }
  }
}

export default new OrderService();
