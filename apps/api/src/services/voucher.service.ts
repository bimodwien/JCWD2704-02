'use strict';
import prisma from '@/prisma';
import { Request } from 'express';
import { TVoucher } from '@/models/voucher.model';
import { randomBytes } from 'crypto';
import { $Enums, CategoryVoucher, Type } from '@prisma/client';

class VoucherService {
  static async getAll(req: Request) {
    const { productName, storeName, page, limit } = req.query;
    const pageNumber = parseInt(page as string) || 1;
    const pageSize = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * pageSize;

    const whereClause: any = {
      isValid: true,
      isDeleted: false,
      endDate: {
        gte: new Date(),
      },
    };

    if (productName) {
      whereClause.product = { name: { contains: productName as string } };
    }
    if (storeName) {
      whereClause.store = { name: { contains: storeName as string } };
    }

    const voucherData = await prisma.voucher.findMany({
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
        maxDiscount: true,
        minTransaction: true,
        minTotalPurchase: true,
        voucherCode: true,
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

    const total = await prisma.voucher.count({ where: whereClause });

    const result = {
      data: voucherData.map((voucher) => ({
        ...voucher,
        productName: voucher.product?.name || null,
        storeName: voucher.store?.name || null,
      })),
      page: pageNumber,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };

    return result;
  }

  static async getById(req: Request): Promise<TVoucher | null> {
    const id = req.params.id;

    const voucher = await prisma.voucher.findUnique({
      where: { id },
      select: {
        id: true,
        productId: true,
        storeId: true,
        description: true,
        category: true,
        type: true,
        value: true,
        maxDiscount: true,
        minTransaction: true,
        minTotalPurchase: true,
        voucherCode: true,
        startDate: true,
        endDate: true,
        isValid: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
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
        VoucherUser: true,
      },
    });

    if (!voucher) {
      throw new Error('Voucher not found');
    }

    return {
      ...voucher,
      productName: voucher.product?.name || null,
      storeName: voucher.store?.name || null,
    } as TVoucher;
  }

  static async create(req: Request): Promise<TVoucher> {
    const {
      productId,
      description,
      storeId,
      category,
      typeInput,
      value,
      maxDiscount,
      minTransaction,
      minTotalPurchase,
      startDate,
      endDate,
    } = req.body;
    if (
      !storeId ||
      !description ||
      !category ||
      !startDate ||
      !endDate ||
      (category !== CategoryVoucher.shippingCost && (!typeInput || !value))
    ) {
      throw new Error(
        'product, store, category, type, value, start Date, and end Date are required',
      );
    }

    if (category === CategoryVoucher.totalPurchase) {
      if (!minTotalPurchase) {
        throw new Error(
          'minTotalPurchase is required for category totalPurchase',
        );
      }
      if (typeInput === 'percentage' && !maxDiscount) {
        throw new Error(
          'maxDiscount is required for category totalPurchase with type percentage',
        );
      }
    } else if (category === CategoryVoucher.shippingCost) {
      if (!minTransaction) {
        throw new Error('minTransaction is required for category shippingCost');
      }
    } else if (category === CategoryVoucher.product) {
      if (!maxDiscount) {
        throw new Error('maxDiscount is required for category voucher product');
      }
    }
    if (category === CategoryVoucher.product) {
      const existingProduct = await prisma.product.findUnique({
        where: { id: productId },
      });
      if (!existingProduct) throw new Error('Product not found');
    }

    const existingStore = await prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!existingStore) throw new Error('Store not found');

    const type =
      category === CategoryVoucher.shippingCost
        ? null
        : typeInput === 'percentage'
          ? Type.percentage
          : Type.nominal;

    const voucherCode = randomBytes(6).toString('hex');

    const voucherData = {
      voucherCode,
      productId,
      storeId,
      description,
      type: type as Type,
      value,
      minTotalPurchase,
      maxDiscount,
      minTransaction,
      isValid: true,
      category: category as CategoryVoucher,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    };

    if (category === CategoryVoucher.product) {
      voucherData.productId = productId;
    }

    if (type) voucherData.type = type;
    if (value) voucherData.value = value;

    if (category === CategoryVoucher.totalPurchase) {
      voucherData.minTotalPurchase = minTotalPurchase;
      if (type === Type.percentage) {
        voucherData.maxDiscount = maxDiscount;
      }
    } else if (category === CategoryVoucher.shippingCost) {
      voucherData.minTransaction = minTransaction;
    } else if (category === CategoryVoucher.product) {
      voucherData.maxDiscount = maxDiscount;
    }

    const voucher = await prisma.$transaction(async (prisma) => {
      return prisma.voucher.create({
        data: voucherData,
        include: { VoucherUser: true },
      });
    });
    return voucher as TVoucher;
  }

  static async deleteVoucher(req: Request) {
    const id = req.params.id;
    await prisma.$transaction(async (prisma) => {
      return prisma.voucher.delete({ where: { id } });
    });
  }
}

export default VoucherService;
