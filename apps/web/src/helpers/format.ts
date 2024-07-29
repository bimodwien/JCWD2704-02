export const formatPrice = (price: number) => {
  return `Rp ${price.toLocaleString('en-ID')}`;
};

export const paymentSrc = 'http://localhost:8000/order/proof/';
export const productSrc = 'http://localhost:8000/products/images/';
