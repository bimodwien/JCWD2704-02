import prisma from '@/prisma';
import { Paid, Status } from '@prisma/client';
import { Request } from 'express';

class OrderDataServie {
  async getAll(req: Request) {
    const { store, sort, invoice, status, paid, startDate, endDate, byDate } =
      req.query;
    const userId = req.user.id;

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

  async detailAdmin(req: Request) {
    const { orderId } = req.params;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, role: true, store: true },
    });

    if (!user) throw new Error('User not found');

    const isSuperAdmin = user.role === 'superAdmin';
    const isStoreAdmin = user.role === 'storeAdmin';

    if (!isSuperAdmin && !isStoreAdmin) {
      throw new Error('Access denied');
    }

    let orderQuery: any = { id: orderId };

    if (isStoreAdmin && user.store) {
      orderQuery.storeId = user.store.id;
    }

    const detail = await prisma.order.findUnique({
      where: orderQuery,
      include: {
        OrderItem: {
          include: {
            product: { include: { ProductImage: { select: { id: true } } } },
          },
        },
        address: true,
        StockHistory: true,
        user: true,
        store: true,
      },
    });

    if (!detail) throw new Error('Order not found');
    return detail;
  }

  async getByUser(req: Request) {
    const userId = req.user.id;
    const { sort, invoice, status, paid, startDate, endDate, byDate } =
      req.query;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 8;

    let filtering: any = {};

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
    const order = await prisma.order.findMany({
      where: {
        ...filtering,
        userId: userId,
      },
      select: {
        id: true,
        invoice: true,
        totalPrice: true,
        status: true,
        paidType: true,
        createdAt: true,
        updatedAt: true,
        OrderItem: {
          include: {
            product: {
              include: {
                ProductImage: {
                  select: { id: true },
                },
              },
            },
          },
        },
        address: true,
      },
      orderBy: orderBy,
      skip: skip,
      take: limit,
    });

    if (!order) throw new Error('Order empty');
    return order;
  }

  async getDetail(req: Request) {
    const { invoice } = req.params;
    const userId = req.user.id;

    const detail = await prisma.order.findUnique({
      where: { invoice: invoice, userId: userId },
      include: {
        OrderItem: {
          include: {
            product: { include: { ProductImage: { select: { id: true } } } },
          },
        },
        address: true,
        store: true,
      },
    });
    if (!detail) throw new Error('Order not found');
    return detail;
  }
}
export default new OrderDataServie();
