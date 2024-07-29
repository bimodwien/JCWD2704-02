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
  };
  store?: {
    name?: string;
    address?: string;
  };
};

export type TAddress = {
  id: string;
  address: string;
  city: {
    province: string;
    cityName: string;
    postalCode: string;
  };
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
