export const formatPrice = (price: number): string => {
  return `Rp ${price.toLocaleString('id-ID')}`;
};

export const paymentSrc = 'http://localhost:8000/order/proof/';
export const productSrc = 'http://localhost:8000/products/images/';
