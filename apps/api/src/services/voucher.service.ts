'use strict';
import prisma from '@/prisma';
import { Request } from 'express';
import { TVoucher } from '@/models/voucher.model';
import { randomBytes } from 'crypto';
import { $Enums, CategoryVoucher, Type } from '@prisma/client';

class VoucherService {
  static async getAll(req: Request) {
    const { storeId, productId } = req.query;
    const whereClause: any = {
      storeId,
      isValid: false,
      isDeleted: false,
    };
    if (productId) {
      whereClause.productId = productId;
    }
    const vouchers = await prisma.voucher.findMany({
      where: whereClause,
    });

    const currentDate = new Date();
    const validVouchers = vouchers.filter(
      (voucher) => voucher.endDate >= currentDate,
    );

    return validVouchers as TVoucher[];
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
      !productId ||
      !storeId ||
      !description ||
      !category ||
      !typeInput ||
      !value ||
      !startDate ||
      !endDate
    ) {
      throw new Error(
        'product, store, category, type, value, start Date, and end Date are required',
      );
    }
    if (category === CategoryVoucher.totalPurchase && !minTotalPurchase) {
      throw new Error(
        'minTotalPurchase are required for category totalPurchase',
      );
    } else if (category === CategoryVoucher.totalPurchase && !maxDiscount) {
      throw new Error('maxDiscount are required for category totalPurchase');
    } else if (category === CategoryVoucher.shippingCost && !minTransaction) {
      throw new Error('minTransaction are required for category shippingCost');
    } else if (category === CategoryVoucher.product && !maxDiscount) {
      throw new Error('maxDiscount are required for category voucher product');
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!existingProduct) throw new Error('Product not found');

    const existingStore = await prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!existingStore) throw new Error('Store not found');

    const type =
      (typeInput == 'percentage' && $Enums.Type.percentage) ||
      (typeInput == 'nominal' && $Enums.Type.nominal);

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
      category: category as CategoryVoucher,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    };

    if (category === CategoryVoucher.totalPurchase) {
      voucherData.minTotalPurchase = minTotalPurchase;
      voucherData.maxDiscount = maxDiscount;
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
      return prisma.voucher.update({
        where: { id },
        data: {
          isValid: true,
        },
      });
    });
  }
}

export default VoucherService;
