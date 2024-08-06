export const formatPrice = (price: number): string => {
  return `Rp ${price.toLocaleString('id-ID')}`;
};

const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:8000';

export const paymentSrc = `${baseUrl}/orders/proof/`;
export const productSrc = `${baseUrl}/products/images/`;
export const categorySrc = `${baseUrl}/category/images/`;
