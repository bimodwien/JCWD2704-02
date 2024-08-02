export type TStockHistory = {
  id: string;
  productId: string;
  storeId: string;
  quantityChange: number;
  reason: string;
  Product: {
    id: string;
    name: string;
  };
  Store: {
    id: string;
    name: string;
  };
  Stock: {
    quantity: number;
  };
};
