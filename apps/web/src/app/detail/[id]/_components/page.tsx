'use client';

import React from 'react';
import { PiTrolleyFill } from 'react-icons/pi';
import Link from 'next/link';
import { axiosInstance } from '@/lib/axios';
import AddToCartButton from './addToCart';
import { productSrc } from '@/helpers/format';

type Props = { dataProduct: any };

const DetailComponent = ({ dataProduct }: Props) => {
  const hasProductImage =
    dataProduct?.ProductImage && dataProduct.ProductImage.length > 0;

  return (
    <>
      <section className="py-8 flex justify-center items-center bg-[#F4F7FE] min-h-lvh md:py-16 antialiased">
        <div className="max-w-screen-xl px-4 mx-auto 2xl:px-0">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 xl:gap-16">
            <div className="shrink-0 max-w-md lg:max-w-lg mx-auto">
              {hasProductImage && (
                <img
                  className="w-full border border-gray-200 rounded-lg"
                  src={`${productSrc}${dataProduct.ProductImage[0].id}`}
                  alt="sample"
                />
              )}
            </div>
            <div className="mt-6 sm:mt-8 lg:mt-0">
              <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                {dataProduct?.name}
              </h1>
              <div className="mt-4 sm:items-center sm:gap-4 sm:flex">
                <p className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
                  Rp {dataProduct?.price}
                </p>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <p className="text-sm font-medium leading-none text-gray-500">
                    weight: {dataProduct?.weight}gr.
                  </p>
                </div>
              </div>
              <div className="mt-6 sm:gap-4 sm:flex sm:flex-col sm:mt-8">
                <AddToCartButton productId={dataProduct?.id} />
                <Link
                  href={'/'}
                  className="flex items-center justify-center py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100"
                >
                  Back to Home
                </Link>
              </div>
              <hr className="my-6 md:my-8 border-gray-200" />
              <p className="mb-6 text-gray-500">{dataProduct?.description}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default DetailComponent;
