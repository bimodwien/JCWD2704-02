'use strict';
import prisma from '@/prisma';
import { $Enums, CategoryDisc, Prisma, Type } from '@prisma/client';
import { Request } from 'express';
import { TDiscount } from '@/models/discount.model';

class DiscountService {
  static async getAll(req: Request) {
    const { productName, storeName, page, limit } = req.query;
    const pageNumber = parseInt(page as string) || 1;
    const pageSize = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * pageSize;
    const whereClause: any = {};
    if (productName) {
      whereClause.product = { name: { contains: productName as string } };
    }
    if (storeName) {
      whereClause.store = { name: { contains: storeName as string } };
    }
    const discountData = await prisma.productDiscount.findMany({
      where: whereClause,
      skip: skip,
      take: pageSize,
      select: {
        id: true,
        productId: true,
        storeId: true,
        description: true,
        category: true,
        type: true,
        value: true,
        startDate: true,
        endDate: true,
        product: {
          select: {
            id: true,
            name: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const total = await prisma.productDiscount.count({ where: whereClause });

    return {
      data: discountData,
      page: pageNumber,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  static async getById(req: Request): Promise<TDiscount | null> {
    const id = req.params.id;
    const data = await prisma.productDiscount.findUnique({
      where: { id },
      select: {
        id: true,
        productId: true,
        storeId: true,
        type: true,
        value: true,
        startDate: true,
        endDate: true,
      },
    });
    return data;
  }

  static async create(req: Request): Promise<TDiscount> {
    const {
      productId,
      storeId,
      description,
      typeInput,
      categoryInput,
      value,
      startDate,
      endDate,
    } = req.body;
    if (
      !productId ||
      !storeId ||
      !description ||
      !categoryInput ||
      !startDate ||
      !endDate ||
      (categoryInput === 'discount' && !typeInput) ||
      (categoryInput === 'discount' && !value)
    ) {
      console.log('Validation failed');
      throw new Error('All fields are required');
    }
    const existingStock = await prisma.stock.findFirst({
      where: { productId, storeId },
    });
    if (!existingStock) {
      console.log("Product isn't found in this store");
      throw new Error("Product isn't found in this store");
    }
    const type =
      (typeInput === 'percentage' && $Enums.Type.percentage) ||
      (typeInput === 'nominal' && $Enums.Type.nominal) ||
      null;
    const category =
      (categoryInput === 'buyGet' && CategoryDisc.buyGet) ||
      (categoryInput === 'discount' && CategoryDisc.discount);

    let discountValue = value;

    if (type === $Enums.Type.percentage) {
      discountValue = value / 100;
    }

    const discountData: Prisma.ProductDiscountCreateInput = {
      product: { connect: { id: productId } },
      store: { connect: { id: storeId } },
      description,
      value: discountValue,
      category: category as CategoryDisc,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      stock: {
        connect: { id: existingStock.id },
      },
    };

    if (category === $Enums.CategoryDisc.buyGet) {
      discountData.value = null;
      discountData.type = null;
    } else if (category === $Enums.CategoryDisc.discount) {
      discountData.value = discountValue;
      discountData.type = type;
    }
    try {
      const discount = await prisma.$transaction(async (prisma) => {
        const createdDiscount = await prisma.productDiscount.create({
          data: discountData,
        });
        return createdDiscount;
      });
      return discount;
    } catch (error) {
      console.error('Error creating discount:', error);
      throw new Error('Failed to create discount');
    }
  }

  static async update(req: Request): Promise<TDiscount> {
    const id = req.params.id;
    const { productId, storeId, type, description, value, startDate, endDate } =
      req.body;
    if (
      !productId ||
      description ||
      storeId ||
      type ||
      value ||
      startDate ||
      endDate
    )
      throw new Error('All fields are required');
    const existingDiscount = await prisma.productDiscount.findUnique({
      where: { id },
    });
    if (!existingDiscount) throw new Error('Discount not found');
    const updatedDiscount = await prisma.$transaction(async (prisma) => {
      const existingStock = await prisma.stock.findFirst({
        where: { id: productId, storeId },
      });
      if (!existingStock) throw new Error("Product isn't found in this store");
      return prisma.productDiscount.update({
        where: { id },
        data: {
          productId,
          storeId,
          description,
          type: type as Type,
          value,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
      });
    });
    return updatedDiscount;
  }

  static async deleteDiscount(req: Request) {
    await prisma.$transaction(async (prisma) => {
      const id = req.params.id;
      const existingDiscount = await prisma.productDiscount.findUnique({
        where: { id },
      });
      if (!existingDiscount) throw new Error('Discount not found');
      const deletedDiscount = await prisma.productDiscount.delete({
        where: { id },
      });
      return deletedDiscount;
    });
  }
}

export default DiscountService;
