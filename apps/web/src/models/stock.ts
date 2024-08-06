export type TStock = {
  id: string;
  productId: string;
  storeId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
  };
  store: {
    id: string;
    name: string;
  };
  originalPrice: number;
  discountedPrice: number;
  priceDiscount: number;
};
