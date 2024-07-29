import { TProduct } from './product';
import { TStore } from './store.model';

export type TDiscount = {
  id: string;
  productId: string;
  storeId: string;
  description: string;
  category: string;
  type: string | null;
  value: number | null;
  startDate: Date;
  endDate: Date;
  product: TProduct;
  store: TStore;
};
