import { CategoryDisc, Type } from '@prisma/client';

export type TDiscount = {
  id: string;
  productId: string;
  storeId: string;
  type?: Type | null;
  category?: CategoryDisc;
  value?: number | null;
  startDate: Date;
  endDate: Date;
};
