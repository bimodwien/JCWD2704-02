// import React from 'react';
// import DetailComponent from './_components/page';
// import { axiosInstance } from '@/lib/axios';

// const PageDetail = async ({ params }: { params: { id: string } }) => {
//   const { id } = params;
//   const response = await axiosInstance().get(`/products/${id}`);
//   const dataProduct = response.data.data;

//   return (
//     <>
//       <DetailComponent dataProduct={dataProduct} />
//     </>
//   );
// };

// export default PageDetail;

'use client';
import React, { useEffect, useState } from 'react';
import DetailComponent from './_components/page';
import { axiosInstance } from '@/lib/axios';
import { useParams } from 'next/navigation';

const PageDetail = () => {
  const [product, setProduct] = useState<any | null>(null);
  const params = useParams();
  const { id } = params;

  const fetchOrderData = async () => {
    try {
      const response = await axiosInstance().get(`/products/${id}`);
      const { data } = response.data;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching transaction data:', error);
    }
  };

  useEffect(() => {
    fetchOrderData();
  }, [id]);

  return (
    <>
      <DetailComponent dataProduct={product} />
    </>
  );
};

export default PageDetail;
