'use strict';
import prisma from '@/prisma';
import { Request } from 'express';

class StockService {
  static async getAll(req: Request) {
    const { productName, storeName } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const stockData = await prisma.stock.findMany({
      where: {
        product: productName
          ? { name: { contains: productName as string } }
          : undefined,
        store: storeName
          ? { name: { contains: storeName as string } }
          : undefined,
        isDeleted: false,
      },
      skip: skip,
      take: limit,
      select: {
        id: true,
        productId: true,
        storeId: true,
        quantity: true,
        product: { select: { id: true, name: true } },
        store: { select: { id: true, name: true } },
      },
    });
    const total = await prisma.stock.count();
    return {
      data: stockData,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
  static async getById(req: Request) {
    const id = req.params.id;
    const data = await prisma.stock.findUnique({
      where: { id, isDeleted: false },
      select: {
        id: true,
        productId: true,
        storeId: true,
        quantity: true,
        product: { select: { id: true, name: true } },
        store: { select: { id: true, name: true } },
      },
    });
    return data;
  }

  static async create(req: Request) {
    await prisma.$transaction(async () => {
      const { productId, storeId, quantity } = req.body;
      console.log(productId, storeId, quantity);

      const existingStock = await prisma.stock.findUnique({
        where: { productId_storeId: { productId, storeId } },
      });
      if (existingStock) {
        const updatedStock = await prisma.stock.update({
          where: { productId_storeId: { productId, storeId } },
          data: { quantity: existingStock.quantity + Number(quantity) },
        });
        return updatedStock;
      }

      const data = { productId, storeId, quantity: Number(quantity) };
      const newStock = await prisma.stock.create({
        data,
      });
      return newStock;
    });
  }

  static async update(req: Request) {
    await prisma.$transaction(async (prisma) => {
      const id = req.params.id;
      const quantity: number = req.body.quantity;
      const editedStock = await prisma.stock.update({
        where: { id },
        data: { quantity: Number(quantity) },
      });
      return editedStock;
    });
  }

  static async deleteStock(req: Request) {
    await prisma.$transaction(async (prisma) => {
      const id = req.params.id;
      const existingStock = await prisma.stock.findUnique({
        where: { id },
      });
      if (!existingStock) throw new Error('Stock not found');
      await prisma.stock.update({
        where: { id },
        data: { isDeleted: true },
      });
    });
  }
}

export default StockService;
