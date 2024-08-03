import React from 'react';
import DetailComponent from './_components/page';
import { axiosInstance } from '@/lib/axios';

const PageDetail = async ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const response = await axiosInstance().get(`/products/${id}`);
  const dataProduct = response.data.data;

  return (
    <>
      <DetailComponent dataProduct={dataProduct} />
    </>
  );
};

export default PageDetail;
