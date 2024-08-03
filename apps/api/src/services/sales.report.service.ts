'use strict';

import prisma from '@/prisma';
import { Request } from 'express';

class ReportService {
  static async getMonthlySalesReport(req: Request) {
    const { storeId, startMonth, endMonth } = req.query;

    const whereClause: any = {
      status: 'confirmed',
    };
    if (storeId) {
      whereClause.storeId = storeId as string;
    }
    if (startMonth || endMonth) {
      whereClause.createdAt = {};
      if (startMonth) {
        whereClause.createdAt.gte = new Date(`${startMonth}-01`);
      }
      if (endMonth) {
        const [year, month] = (endMonth as string).split('-').map(Number);
        const endDate = new Date(year, month, 0);
        whereClause.createdAt.lte = endDate;
      }
    }

    const result = await prisma.order.findMany({
      where: whereClause,
      select: {
        createdAt: true,
        totalPrice: true,
      },
    });

    const groupedResult = result.reduce((acc: any, order) => {
      const month = order.createdAt.toISOString().substring(0, 7);
      if (!acc[month]) {
        acc[month] = { totalSales: 0, totalRevenue: 0 };
      }
      acc[month].totalSales += 1;
      acc[month].totalRevenue += order.totalPrice;
      return acc;
    }, {});

    const response = Object.keys(groupedResult).map((month) => ({
      month,
      totalSales: groupedResult[month].totalSales,
      totalRevenue: groupedResult[month].totalRevenue,
    }));

    return response;
  }

  static async getMonthlySalesByCategoryReport(req: Request) {
    const { storeId, startMonth, endMonth } = req.query;

    const whereClause: any = {
      status: 'confirmed',
    };
    if (storeId) {
      whereClause.storeId = storeId as string;
    }
    if (startMonth || endMonth) {
      whereClause.createdAt = {};
      if (startMonth) {
        whereClause.createdAt.gte = new Date(`${startMonth}-01`);
      }
      if (endMonth) {
        const [year, month] = (endMonth as string).split('-').map(Number);
        const endDate = new Date(year, month, 0); // Mendapatkan hari terakhir dari bulan tersebut
        whereClause.createdAt.lte = endDate;
      }
    }

    const result = await prisma.orderItem.findMany({
      where: {
        order: whereClause,
      },
      select: {
        order: {
          select: {
            createdAt: true,
          },
        },
        product: {
          select: {
            category: {
              select: {
                name: true,
              },
            },
          },
        },
        price: true,
      },
    });

    const groupedResult = result.reduce((acc: any, orderItem) => {
      const month = orderItem.order.createdAt.toISOString().substring(0, 7); // Format YYYY-MM
      const category = orderItem.product.category?.name || 'Uncategorized';
      if (!acc[month]) {
        acc[month] = {};
      }
      if (!acc[month][category]) {
        acc[month][category] = { totalSales: 0, totalRevenue: 0 };
      }
      acc[month][category].totalSales += 1;
      acc[month][category].totalRevenue += orderItem.price;
      return acc;
    }, {});

    const response = Object.keys(groupedResult).flatMap((month) =>
      Object.keys(groupedResult[month]).map((category) => ({
        month,
        category,
        totalSales: groupedResult[month][category].totalSales,
        totalRevenue: groupedResult[month][category].totalRevenue,
      })),
    );

    return response;
  }

  static async getMonthlySalesByProductReport(req: Request) {
    const { storeId, startMonth, endMonth } = req.query;

    const whereClause: any = {
      status: 'confirmed',
    };
    if (storeId) {
      whereClause.storeId = storeId as string;
    }
    if (startMonth || endMonth) {
      whereClause.createdAt = {};
      if (startMonth) {
        whereClause.createdAt.gte = new Date(`${startMonth}-01`);
      }
      if (endMonth) {
        const [year, month] = (endMonth as string).split('-').map(Number);
        const endDate = new Date(year, month, 0); // Mendapatkan hari terakhir dari bulan tersebut
        whereClause.createdAt.lte = endDate;
      }
    }

    const result = await prisma.orderItem.findMany({
      where: {
        order: whereClause,
      },
      select: {
        order: {
          select: {
            createdAt: true,
          },
        },
        product: {
          select: {
            name: true,
          },
        },
        price: true,
      },
    });

    const groupedResult = result.reduce((acc: any, orderItem) => {
      const month = orderItem.order.createdAt.toISOString().substring(0, 7); // Format YYYY-MM
      const product = orderItem.product.name;
      if (!acc[month]) {
        acc[month] = {};
      }
      if (!acc[month][product]) {
        acc[month][product] = { totalSales: 0, totalRevenue: 0 };
      }
      acc[month][product].totalSales += 1;
      acc[month][product].totalRevenue += orderItem.price;
      return acc;
    }, {});

    const response = Object.keys(groupedResult).flatMap((month) =>
      Object.keys(groupedResult[month]).map((product) => ({
        month,
        product,
        totalSales: groupedResult[month][product].totalSales,
        totalRevenue: groupedResult[month][product].totalRevenue,
      })),
    );

    return response;
  }
}

export default ReportService;
