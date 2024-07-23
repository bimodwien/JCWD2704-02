export type TProduct = {
  id: string;
  name: string;
  price: number;
  description: string;
  category: {
    id: string;
    name: string;
  };
  ProductImage: {
    id: string;
    image: Buffer;
  }[];
  Stock: {
    productId: string;
    store: {
      id: string;
      name: string;
      latitude: number;
      longitude: number;
      city: string;
    };
    quantity: number;
  }[];
};
