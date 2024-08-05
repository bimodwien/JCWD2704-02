import prisma from '@/prisma';
import { StockChangeReason } from '@prisma/client';
import { Request } from 'express';

class stockHistoryService {
  static async getAll(req: Request) {
    const { productId, storeId, reason } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const stockHistoryData = await prisma.stockHistory.findMany({
      where: {
        productId: productId ? (productId as string) : undefined,
        storeId: storeId ? (storeId as string) : undefined,
        // reason: reason ? { contains: reason as string } : undefined,
        reason: reason as StockChangeReason,
        isDeleted: false,
      },
      skip: skip,
      take: limit,
      select: {
        id: true,
        productId: true,
        storeId: true,
        stockId: true,
        quantityChange: true,
        reason: true,
        createdAt: true,
        updatedAt: true,
        Product: { select: { id: true, name: true } },
        Stock: { select: { id: true, quantity: true } },
        Store: { select: { id: true, name: true } },
      },
    });

    const total = await prisma.stockHistory.count({
      where: {
        productId: productId ? (productId as string) : undefined,
        storeId: storeId ? (storeId as string) : undefined,
        // reason: reason ? { contains: reason as string } : undefined,
        reason: reason as StockChangeReason,
        isDeleted: false,
      },
    });

    return {
      data: stockHistoryData,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getById(req: Request) {
    const id = req.params.id;
    const data = await prisma.stockHistory.findUnique({
      where: { id, isDeleted: false },
      select: {
        id: true,
        productId: true,
        storeId: true,
        stockId: true,
        quantityChange: true,
        reason: true,
        createdAt: true,
        updatedAt: true,
        Product: { select: { id: true, name: true } },
        Stock: { select: { id: true, quantity: true } },
        Store: { select: { id: true, name: true } },
      },
    });
    return data;
  }
}

export default stockHistoryService;
