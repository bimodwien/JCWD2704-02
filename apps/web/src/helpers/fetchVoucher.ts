import { axiosInstance } from '@/lib/axios';
import { TVoucher } from '@/models/voucher';

export async function fetchVoucher(
  page: number,
  limit: number,
  productName: string,
  storeName: string,
  setVoucher: (value: React.SetStateAction<TVoucher[]>) => void,
) {
  const axios = axiosInstance();
  const queryParams: Record<string, any> = {
    page,
    limit,
    productName,
    storeName,
  };
  try {
    const response = await axios.get('/vouchers', {
      params: { ...queryParams },
    });
    const voucherData = response.data;
    setVoucher(voucherData.data.data);
  } catch (error) {
    console.log(error);
  }
}

export async function fetchDetailVoucher(
  id: string,
  setVoucher: (value: React.SetStateAction<TVoucher | null>) => void,
) {
  try {
    const axios = axiosInstance();
    const response = await axios.get(`/vouchers/${id}`);
    const detail = response.data.data;
    setVoucher(detail);
  } catch (error) {
    console.log(error);
  }
}
