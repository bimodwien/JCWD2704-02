import { TProduct } from './product';
import { TStore } from './store.model';

export type TVoucher = {
  id: string;
  productId: string;
  storeId: string;
  description: string;
  category: string;
  typeInput: string | null;
  value: number | null;
  maxDiscount: number | null;
  minTotalPurchase: number | null;
  minTransaction: number | null;
  voucherCode: string;
  startDate: Date;
  endDate: Date;
  product: TProduct;
  store: TStore;
};
