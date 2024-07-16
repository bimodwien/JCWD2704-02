import { Type } from '@prisma/client';

export type TProduct = {
  id?: string;
  name: string;
  description: string;
  weight: number;
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Store = {
  id: string;
  name: string;
  address: string;
  postalCode: number;
  latitude: number;
  longitude: number;
  createdAt: Date;
  updatedAt: Date;
};

export type TProductImage = {
  id: string;
  image: Buffer;
};

export type TStock = {
  id: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
};

export type TProductDiscount = {
  id: string;
  value: number;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type TVoucher = {
  id: string;
  voucherCode: string;
  type: Type;
  value: number;
  maxDiscount: number;
  minTransaction: number;
  minTotalPurchase: number;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
};

// satu product cuma 1 kategory
// satu kategory itu punya banyak product
