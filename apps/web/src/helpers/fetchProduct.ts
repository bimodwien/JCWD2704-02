import { axiosInstance } from '@/lib/axios';
import { TProduct } from '@/models/product';
import React from 'react';

export async function fetchProduct(
  page: number,
  limit: number,
  name: string,
  setProduct: (value: React.SetStateAction<TProduct[]>) => void,
) {
  const axios = axiosInstance();
  const queryParams: Record<string, any> = {
    page,
    limit,
    name,
  };
  try {
    const response = await axios.get('/products', {
      params: { ...queryParams },
    });
    const productData = response.data;
    setProduct(productData.data.data);
  } catch (error) {
    console.log(error);
  }
}

export async function deleteProduct(
  id: string,
  page: number,
  limit: number,
  name: string,
  setProduct: (value: React.SetStateAction<TProduct[]>) => void,
) {
  const axios = axiosInstance();
  try {
    await axios.delete(`/products/${id}`);
    fetchProduct(page, limit, name, setProduct);
  } catch (error) {
    console.log(error);
  }
}

export async function getNearestProducts(
  latitude: number,
  longitude: number,
  setProducts: (value: React.SetStateAction<TProduct[]>) => void,
) {
  try {
    const response = await axiosInstance().get('/products/all', {
      params: { latitude, longitude },
    });
    setProducts(response.data);
  } catch (error) {
    console.error('Error fetching nearest products:', error);
  }
}

export async function getAllData(
  setProducts: (value: React.SetStateAction<TProduct[]>) => void,
) {
  try {
    const response = await axiosInstance().get('/products/allData');
    setProducts(response.data);
  } catch (error) {
    console.error('Error fetching all products:', error);
  }
}
