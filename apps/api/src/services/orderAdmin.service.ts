import { Request } from 'express';
import prisma from '../prisma';
import { Paid, Status } from '@prisma/client';
import { equal } from 'joi';

class OrderAdminService {
  async getAll(req: Request) {
    const { store, sort, invoice, status, paid, startDate, endDate, byDate } =
      req.query;
    const userId = 'superAdmin';

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, role: true, store: true },
    });

    if (!user) throw new Error('user not found');

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 8;

    let filtering: any = {};

    if (store && user.role === 'superAdmin') {
      filtering.store = {
        name: {
          contains: store as string,
        },
      };
    }

    if (invoice) {
      filtering.invoice = {
        contains: invoice as string,
      };
    }

    if (status) {
      filtering.status = status as Status;
    }

    if (paid) {
      filtering.paidType = paid as Paid;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (byDate === 'yes' && startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);

      if (start > end) {
        throw new Error('start date must be before end date');
      }

      if (start.getTime() === end.getTime()) {
        filtering.createdAt = {
          gte: start,
          lte: end,
        };
      } else {
        filtering.createdAt = {
          gte: start,
          lte: end,
        };
      }
    }

    const skip = (page - 1) * limit;

    let orderBy: any = {};

    if (sort === 'desc' || sort === 'asc') {
      orderBy.createdAt = sort === 'desc' ? 'desc' : 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    if (user.role === 'superAdmin') {
      const orders = await prisma.order.findMany({
        where: filtering,
        select: {
          id: true,
          invoice: true,
          user: { select: { name: true, email: true } },
          totalPrice: true,
          shippingCost: true,
          shippedAt: true,
          paidType: true,
          payment_method: true,
          paidAt: true,
          processedAt: true,
          confirmedAt: true,
          cancelledAt: true,
          status: true,
          createdAt: true,
          store: { select: { name: true, address: true } },
        },
        orderBy: orderBy,
        skip: skip,
        take: limit,
      });
      return orders;
    } else if (user.role === 'storeAdmin') {
      const orders = await prisma.order.findMany({
        where: {
          ...filtering,
          storeId: user.store?.id,
        },
        select: {
          id: true,
          invoice: true,
          user: { select: { name: true, email: true } },
          totalPrice: true,
          shippingCost: true,
          shippedAt: true,
          paidType: true,
          payment_method: true,
          paidAt: true,
          processedAt: true,
          confirmedAt: true,
          cancelledAt: true,
          status: true,
          createdAt: true,
          store: { select: { name: true, address: true } },
        },
        orderBy: orderBy,
        skip: skip,
        take: limit,
      });
      return orders;
    } else {
      throw new Error('Unauthorized');
    }
  }

  async checkPayment(req: Request) {
    const { orderId } = req.params;
    const { check } = req.body as { check: string };
    const userId = 'clz2ue5gh000444oxgx0a6qf7';

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

    if (check !== 'deny' && check !== 'confirm')
      throw new Error('invalid check');

    if (check === 'deny') {
      const update = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'waitingPayment',
        },
      });
      return update;
    } else {
      const update = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'processed',
          processedAt: new Date(),
        },
      });
      return update;
    }
  }

  async adminCancel(req: Request) {
    const { orderId } = req.params;
    const userId = 'clz2ue5gh000444oxgx0a6qf7';

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, store: { select: { id: true } } },
    });

    if (!user) {
      throw new Error('user not found');
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { OrderItem: true },
    });

    if (!order) {
      throw new Error('order not found');
    }

    if (order.status === 'shipped') {
      throw new Error('order has already been shipped and cannot be cancelled');
    }

    if (order.status === 'confirmed') {
      throw new Error(
        'order has already been confirmed and cannot be cancelled',
      );
    }

    if (user.role === 'storeAdmin' && order.storeId !== user.store?.id) {
      throw new Error(
        'unauthorized: cannot access orders from a different store',
      );
    }

    const cancelledOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
      },
    });

    for (const item of order.OrderItem) {
      await prisma.stock.update({
        where: {
          productId_storeId: {
            productId: item.productId,
            storeId: order.storeId,
          },
        },
        data: {
          quantity: {
            increment: item.quantity,
          },
        },
      });
    }

    return cancelledOrder;
  }

  async shipped(req: Request) {
    const { orderId } = req.params;
    const userId = 'clz2ue5gh000444oxgx0a6qf7';
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

    const shippedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'shipped',
        shippedAt: new Date(),
      },
    });

    return shippedOrder;
  }
}

export default new OrderAdminService();
