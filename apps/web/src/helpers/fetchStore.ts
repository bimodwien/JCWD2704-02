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

export async function getAllStore(
  setData: (value: React.SetStateAction<TStore[]>) => void,
) {
  const axios = axiosInstance();
  try {
    const response = await axios.get(`/store/`);
    setData(response.data.data);
  } catch (error) {
    console.log('====================================');
    console.log(error);
    console.log('====================================');
  }
}

export async function getStoreByStoreId(id: string): Promise<TStore | null> {
  const axios = axiosInstance();
  try {
    const response = await axios.get(`/store/${id}`);
    console.log('====================================');
    console.log('response', response);
    console.log('====================================');
    const data = response.data.data;
    return data;
  } catch (error) {
    console.log('====================================');
    console.log(error);
    console.log('====================================');
    return null;
  }
}

export async function softDeleteStore(
  id: string,
  setData: (value: React.SetStateAction<TStore[]>) => void,
) {
  const axios = axiosInstance();
  try {
    const response = await axios.delete(`/store/delete/${id}`);
    setData(response.data.data);
  } catch (error) {
    console.log('====================================');
    console.log(error);
    console.log('====================================');
  }
}

export async function availableStores(
  setData: (value: React.SetStateAction<TStore[]>) => void,
) {
  const axios = axiosInstance();
  try {
    const response = await axios.get(`/store/available-store`);

    setData(response.data);
  } catch (error) {
    console.log('====================================');
    console.log(error);
    console.log('====================================');
  }
}
