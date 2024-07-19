import { axiosInstance } from '@/lib/axios';
import { TStore } from '@/models/store.model';

export async function fetchStores(
  page: number,
  limit: number,
  search: string,
  setData: (value: React.SetStateAction<TStore[]>) => void,
  setIsLastPage: (value: React.SetStateAction<boolean>) => void,
) {
  const axios = axiosInstance();
  const queryParams: Record<string, any> = {
    page,
    limit,
    search,
  };
  try {
    const response = await axios.get(`/store/`, {
      params: { ...queryParams },
    });
    const storeData = response.data.data;
    setData(storeData);
    setIsLastPage(storeData.totalPages === page);
  } catch (error) {
    console.log(error);
  }
}
