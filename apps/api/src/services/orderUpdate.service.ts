import { Request } from 'express';
import prisma from '../prisma';
import { $Enums, Paid, Status } from '@prisma/client';
import { equal } from 'joi';

class OrderAdminService {
  async checkPayment(req: Request) {
    const { orderId } = req.params;
    const { check } = req.body as { check: string };
    const userId = 'clz5pp21w0005v0gaqyr1c7q8';

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, store: { select: { id: true } } },
    });

    if (!user) {
      throw new Error('user not found');
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new Error('order not found');

    if (user.role === 'storeAdmin' && order.storeId !== user.store?.id) {
      throw new Error(
        'unauthorized: cannot access orders from a different store',
      );
    }

    const role: $Enums.UpdatedBy =
      user.role === 'superAdmin' ? 'superAdmin' : 'storeAdmin';

    if (check !== 'deny' && check !== 'confirm')
      throw new Error('invalid check');

    if (check === 'deny') {
      const update = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'waitingPayment',
          checkedAt: new Date(),
          checkedBy: role,
        },
      });
      return update;
    } else {
      const update = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'processed',
          processedAt: new Date(),
          checkedAt: new Date(),
          checkedBy: role,
        },
      });
      return update;
    }
  }

  async adminCancel(req: Request) {
    const { orderId } = req.params;
    const userId = 'clz5pp21w0005v0gaqyr1c7q8';

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, store: { select: { id: true } } },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { OrderItem: true },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status === 'shipped') {
      throw new Error('Order has already been shipped and cannot be cancelled');
    } else if (order.status === 'confirmed') {
      throw new Error(
        'Order has already been confirmed and cannot be cancelled',
      );
    }

    if (user.role === 'storeAdmin' && order.storeId !== user.store?.id) {
      throw new Error(
        'Unauthorized: Cannot access orders from a different store',
      );
    }

    const role: $Enums.UpdatedBy =
      user.role === 'superAdmin' ? 'superAdmin' : 'storeAdmin';

    const cancel = await prisma.$transaction(async (prisma) => {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancelledBy: role,
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
            `Stock not found for product ${item.productId} and store ${updatedOrder.storeId}`,
          );
        }
      }

      return updatedOrder;
    });

    return cancel;
  }

  async shipped(req: Request) {
    const { orderId } = req.params;
    const userId = 'clz5pp21w0005v0gaqyr1c7q8';
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, store: { select: { id: true } } },
    });

    if (!user) {
      throw new Error('user not found');
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('order not found');
    }

    if (order.status !== 'processed') {
      throw new Error('order has not been processed and cannot be shipped');
    }

    if (user.role === 'storeAdmin' && order.storeId !== user.store?.id) {
      throw new Error(
        'unauthorized: cannot access orders from a different store',
      );
    }

    const role: $Enums.UpdatedBy =
      user.role === 'superAdmin' ? 'superAdmin' : 'storeAdmin';

    const shippedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'shipped',
        shippedAt: new Date(),
        shippedBy: role,
      },
    });

    return shippedOrder;
  }
}

export default new OrderAdminService();
