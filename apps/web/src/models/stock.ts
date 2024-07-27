export type TStock = {
  id: string;
  productId: string;
  storeId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
  };
  store: {
    id: string;
    name: string;
  };
};
