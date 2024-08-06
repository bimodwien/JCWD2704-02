import { axiosInstance } from '@/lib/axios';
import { TDiscount } from '@/models/discount';

export async function fetchDiscount(
  page: number,
  limit: number,
  productName: string,
  storeName: string,
  setDiscount: (value: React.SetStateAction<TDiscount[]>) => void,
) {
  const axios = axiosInstance();
  const queryParams: Record<string, any> = {
    page,
    limit,
    productName,
    storeName,
  };
  try {
    const response = await axios.get('/discounts', {
      params: { ...queryParams },
    });
    const discountData = response.data;
    console.log(discountData.data.data);

    setDiscount(discountData.data.data);
  } catch (error) {
    console.log(error);
  }
}

export async function deleteDiscount(
  id: string,
  page: number,
  limit: number,
  productName: string,
  storeName: string,
  setDiscount: (value: React.SetStateAction<TDiscount[]>) => void,
) {
  const axios = axiosInstance();
  try {
    await axios.delete(`/discounts/${id}`);
    fetchDiscount(page, limit, productName, storeName, setDiscount);
  } catch (error) {
    console.log(error);
  }
}
