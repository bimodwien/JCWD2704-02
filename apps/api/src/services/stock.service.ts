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
        product: { select: { id: true, name: true, price: true } },
        store: { select: { id: true, name: true } },
        ProductDiscount: {
          select: {
            id: true,
            value: true,
            type: true,
            startDate: true,
            endDate: true,
          },
          where: {
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
        },
      },
    });

    console.log('Stock Data:', JSON.stringify(stockData, null, 2));

    const updatedStocks = await prisma.$transaction(async (prisma) => {
      return Promise.all(
        stockData.map(async (stock) => {
          let finalPrice = stock.product.price;
          if (stock.ProductDiscount && stock.ProductDiscount.length > 0) {
            console.log(
              'Product Discounts for Stock ID',
              stock.id,
              ':',
              stock.ProductDiscount,
            );
            stock.ProductDiscount.forEach((discount) => {
              const discountValue = discount.value ?? 0;
              if (discount.type === 'percentage') {
                finalPrice -= finalPrice * (discountValue / 100);
              } else if (discount.type === 'nominal') {
                finalPrice -= discountValue;
              }
            });
          }

          const updatedStock = await prisma.stock.update({
            where: { id: stock.id },
            data: {
              priceDiscount: finalPrice,
            },
          });

          return {
            ...stock,
            originalPrice: stock.product.price,
            discountedPrice: finalPrice,
          };
        }),
      );
    });

    console.log(
      'Updated Stock with Discounts:',
      JSON.stringify(updatedStocks, null, 2),
    );

    const total = await prisma.stock.count({
      where: {
        product: productName
          ? { name: { contains: productName as string } }
          : undefined,
        store: storeName
          ? { name: { contains: storeName as string } }
          : undefined,
        isDeleted: false,
      },
    });

    return {
      data: updatedStocks,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getById(req: Request) {
    const id = req.params.id;
    const data = await prisma.stock.findUnique({
      where: { id },
      select: {
        id: true,
        productId: true,
        storeId: true,
        quantity: true,
        product: { select: { id: true, name: true, price: true } },
        store: { select: { id: true, name: true } },
        ProductDiscount: {
          select: {
            id: true,
            value: true,
            type: true,
            startDate: true,
            endDate: true,
          },
          where: {
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
        },
      },
    });

    if (!data) throw new Error('Stock not found');

    let finalPrice = data.product.price;
    if (data.ProductDiscount && data.ProductDiscount.length > 0) {
      data.ProductDiscount.forEach((discount) => {
        const discountValue = discount.value ?? 0;
        if (discount.type === 'percentage') {
          finalPrice -= finalPrice * (discountValue / 100);
        } else if (discount.type === 'nominal') {
          finalPrice -= discountValue;
        }
      });
    }

    return {
      ...data,
      originalPrice: data.product.price,
      discountedPrice: finalPrice,
    };
  }

  static async create(req: Request) {
    const { productId, storeId, quantity } = req.body;

    const existingStock = await prisma.stock.findUnique({
      where: { productId_storeId: { productId, storeId } },
    });

    if (existingStock) {
      const updatedStock = await prisma.stock.update({
        where: { productId_storeId: { productId, storeId } },
        data: { quantity: existingStock.quantity + Number(quantity) },
      });

      await prisma.stockHistory.create({
        data: {
          productId,
          storeId,
          stockId: updatedStock.id,
          quantityChange: Number(quantity),
          reason: 'Stock increased',
        },
      });

      return updatedStock;
    }

    const newStock = await prisma.stock.create({
      data: {
        productId,
        storeId,
        quantity: Number(quantity),
      },
    });

    await prisma.stockHistory.create({
      data: {
        productId,
        storeId,
        stockId: newStock.id,
        quantityChange: Number(quantity),
        reason: 'New stock created',
      },
    });

    return newStock;
  }

  static async update(req: Request) {
    const id = req.params.id;
    const quantity: number = req.body.quantity;

    const existingStock = await prisma.stock.findUnique({
      where: { id },
    });

    if (!existingStock) throw new Error('Stock not found');

    const quantityChange = quantity - existingStock.quantity;
    const reason = quantityChange > 0 ? 'Stock increased' : 'Stock decreased';

    const editedStock = await prisma.stock.update({
      where: { id },
      data: { quantity: Number(quantity) },
    });

    await prisma.stockHistory.create({
      data: {
        productId: existingStock.productId,
        storeId: existingStock.storeId,
        stockId: id,
        quantityChange,
        reason,
      },
    });

    return editedStock;
  }

  static async deleteStock(req: Request) {
    const id = req.params.id;

    const existingStock = await prisma.stock.findUnique({
      where: { id },
    });

    if (!existingStock) throw new Error('Stock not found');

    await prisma.stock.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}

export default StockService;
