import { CategoryVoucher, Type, VoucherUser } from '@prisma/client';

export type TVoucher = {
  id: string;
  voucherCode: string;
  productId: string;
  storeId: string;
  category: CategoryVoucher;
  type: Type;
  value: number;
  maxDiscount?: number | null;
  minTransaction?: number | null;
  minTotalPurchase?: number | null;
  startDate: Date;
  endDate: Date;
  voucherUser?: VoucherUser[];
};
