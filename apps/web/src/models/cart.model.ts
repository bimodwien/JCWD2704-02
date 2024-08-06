export type TCart = {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
  };
  stock: {
    quantity: number;
    priceDiscount?: number;
  };
  store?: {
    name?: string;
    address?: string;
  };
};

export type TAddress = {
  id: string;
  address: string;
  city: string;
  name: string;
  postalCode: string;
  province: string;
};

export interface CartTableProps {
  cartData: any[];
  fetchCart: () => void;
  totalProduct: (quantity: number, price: number) => number;
  // deleteCart: (cartId: string) => void;
}

export interface QtyProps {
  cart: any;
  fetchCart: () => void;
}

export type TUserVoucher = {
  voucher: any;
  category: string;
  value: number;
  maxDiscount: number;
  type: string;
};
