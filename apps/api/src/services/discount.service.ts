'use strict';
import prisma from '@/prisma';
import { $Enums, CategoryDisc, Type } from '@prisma/client';
import { Request } from 'express';
import { TDiscount } from '@/models/discount.model';

class DiscountService {
  static async getAll(req: Request): Promise<TDiscount[]> {
    const { storeId, productId } = req.query;
    const whereClause: any = { storeId };
    if (productId) {
      whereClause.productId = productId;
    }
    const data = await prisma.productDiscount.findMany({
      where: whereClause,
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
      !typeInput ||
      !value ||
      !startDate ||
      !endDate
    )
      throw new Error('All fields are required');

    const existingStock = await prisma.stock.findFirst({
      where: { productId, storeId },
    });

    if (!existingStock) throw new Error("Product isn't found in this store");

    const type =
      (typeInput == 'percentage' && $Enums.Type.percentage) ||
      (typeInput == 'nominal' && $Enums.Type.nominal);

    const category =
      (categoryInput == 'buyGet' && $Enums.CategoryDisc.buyGet) ||
      (categoryInput == 'discount' && $Enums.CategoryDisc.discount);

    const discountData: any = {
      productId,
      storeId,
      description,
      value,
      category,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    };

    if (category == CategoryDisc.buyGet) {
      discountData.value = null;
    } else if (category == CategoryDisc.discount) {
      discountData.value = value;
      discountData.type = type;
    }

    console.log(discountData);

    const discount = await prisma.$transaction(async (prisma) => {
      return await prisma.productDiscount.create({
        data: discountData,
      });
    });
    return discount;
  }

  static async update(req: Request): Promise<TDiscount> {
    const id = req.params.id;
    const { productId, storeId, type, value, startDate, endDate } = req.body;
    if (!productId || storeId || type || value || startDate || endDate)
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
