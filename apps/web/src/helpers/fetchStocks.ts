import { axiosInstance } from '@/lib/axios';
import { TStock } from '@/models/stock';
import React from 'react';

export async function fetchStock(
  page: number,
  limit: number,
  productName: string,
  storeName: string,
  setStock: (value: React.SetStateAction<TStock[]>) => void,
) {
  const axios = axiosInstance();
  const queryParams: Record<string, any> = {
    page,
    limit,
    productName,
    storeName,
  };
  try {
    const response = await axios.get('/stocks', {
      params: { ...queryParams },
    });
    const stockData = response.data;
    setStock(stockData.data.data);
  } catch (error) {
    console.log(error);
  }
}
