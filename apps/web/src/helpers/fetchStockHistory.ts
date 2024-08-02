import { axiosInstance } from '@/lib/axios';
import { TStockHistory } from '@/models/stockHistory';

export async function fetchStockHistory(
  page: number,
  limit: number,
  productName: string,
  storeName: string,
  setStockHistory: (value: React.SetStateAction<TStockHistory[]>) => void,
) {
  const axios = axiosInstance();
  const queryParams: Record<string, any> = {
    page,
    limit,
    productName,
    storeName,
  };
  try {
    const response = await axios.get('/stock-history', {
      params: { ...queryParams },
    });
    const stockHistoryData = response.data;
    console.log(stockHistoryData.data.data);
    setStockHistory(stockHistoryData.data.data);
  } catch (error) {
    console.log(error);
  }
}
