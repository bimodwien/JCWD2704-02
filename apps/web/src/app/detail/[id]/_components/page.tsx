'use client';

import React from 'react';
import { PiTrolleyFill } from 'react-icons/pi';
import Link from 'next/link';

type Props = { dataProduct: any };

const DetailComponent = ({ dataProduct }: Props) => {
  return (
    <>
      <section className="py-8 flex justify-center items-center bg-[#FAF9F6] min-h-lvh md:py-16 antialiased">
        <div className="max-w-screen-xl px-4 mx-auto 2xl:px-0">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 xl:gap-16">
            <div className="shrink-0 max-w-md lg:max-w-lg mx-auto">
              <img
                className="w-full border border-gray-200 rounded-lg"
                src={`http://localhost:8000/products/images/${dataProduct.ProductImage[0].id}`}
                alt="sample"
              />
            </div>
            <div className="mt-6 sm:mt-8 lg:mt-0">
              <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                {dataProduct.name}
              </h1>
              <div className="mt-4 sm:items-center sm:gap-4 sm:flex">
                <p className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
                  IDR. {dataProduct.price}
                </p>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <p className="text-sm font-medium leading-none text-gray-500">
                    weight: {dataProduct.weight}gr.
                  </p>
                </div>
              </div>
              <div className="mt-6 sm:gap-4 sm:items-center sm:flex sm:mt-8">
                <Link
                  href={'/'}
                  className="flex items-center justify-center py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100"
                >
                  Back to Home
                </Link>
                <button className="w-full sm:w-fit text-white mt-4 sm:mt-0 bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none flex items-center justify-center">
                  <PiTrolleyFill className="mr-2" /> Add to cart
                </button>
              </div>
              <hr className="my-6 md:my-8 border-gray-200" />
              <p className="mb-6 text-gray-500">{dataProduct.description}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default DetailComponent;
