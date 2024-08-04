import { axiosInstance } from '@/lib/axios';
import { TCategory } from '@/models/category';

import React from 'react';

export async function fetchCategory(
  page: number,
  limit: number,
  name: string,
  setCategory: (value: React.SetStateAction<TCategory[]>) => void,
) {
  const axios = axiosInstance();
  const queryParams: Record<string, any> = {
    page,
    limit,
    name,
  };
  try {
    const response = await axios.get('/category', {
      params: { ...queryParams },
    });
    const categoryData = response.data;
    setCategory(categoryData.data.data);
  } catch (error) {
    console.log(error);
  }
}

export async function deleteCategory(
  id: string,
  page: number,
  limit: number,
  name: string,
  setCategory: (value: React.SetStateAction<TCategory[]>) => void,
) {
  const axios = axiosInstance();
  try {
    await axios.delete(`/category/${id}`);
    fetchCategory(page, limit, name, setCategory);
  } catch (error) {
    console.log(error);
  }
}

export async function getAll(
  setCategory: (value: React.SetStateAction<TCategory[]>) => void,
) {
  const axios = axiosInstance();
  try {
    const response = await axios.get(`/category/all`);
    const categories = response.data.map((category: TCategory) => ({
      ...category,
      imageUrl: category.image
        ? `data:image/jpeg;base64,${Buffer.from(category.image).toString('base64')}`
        : '',
    }));
    setCategory(categories);
  } catch (error) {
    console.log(error);
  }
}
