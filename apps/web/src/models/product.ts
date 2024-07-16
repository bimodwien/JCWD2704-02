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
};
