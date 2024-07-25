export type TOrder = {
  id: string;
  invoice: string;
  status: string;
  totalPrice: number;
  address: {
    address: string;
  };
  OrderItem: [TOrderItem];
  createdAt: Date;
  paidAt: Date;
  processedAt: Date;
  shippedAt: Date;
  confirmedAt: Date;
  cancelledAt: Date;
  payment_method: string;
  paidType: string;
  snap_token: string;
};

export type TOrderItem = {
  product: {
    id: string;
    name: string;
    price: number;
    ProductImage: [TImage];
  };
  store?: {
    name?: string;
    address?: string;
    city?: {};
  };
  quantity: number;
  price: number;
};

export type TImage = {
  id: string;
};
