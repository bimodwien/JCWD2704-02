'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { axiosInstance } from '@/lib/axios';
import { AxiosError } from 'axios';
import { fetchProduct } from '@/helpers/fetchProduct';
import { fetchStores } from '@/helpers/fetchStore';
import { TProduct } from '@/models/product';
import { TStore } from '@/models/store.model';
import { useRouter } from 'next/navigation';

const AddStock = () => {
  const router = useRouter();
  const initialValues = {
    quantity: 0,
    productId: '',
    storeId: '',
  };
  const [products, setProducts] = useState<TProduct[]>([]);
  const [stores, setStores] = useState<TStore[]>([]);

  useEffect(() => {
    fetchProduct(1, 100, '', setProducts);
    fetchStores(1, 100, '', setStores, () => {});
  }, []);

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object().shape({
      productId: Yup.string().required('Product is required'),
      storeId: Yup.string().required('Store is required'),
      quantity: Yup.number().required('Quantity wajib diisi'),
    }),
    onSubmit: async (values) => {
      try {
        const { data } = await axiosInstance().post('/stocks', values);
        alert(data.message);
        router.push(`/dashboard/stock`);
      } catch (error) {
        if (error instanceof AxiosError) alert(error.response?.data?.message);
        else if (error instanceof Error) console.log(error.message);
      }
    },
  });
  return (
    <>
      <section className="bg-[#F4F7FE] min-h-lvh">
        <div className="py-8 px-4 mx-auto max-w-2xl lg:py-16">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Add a new stock
          </h2>
          <form onSubmit={formik.handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
              <div className="w-full">
                <label
                  htmlFor="product"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Product Name
                </label>
                <select
                  id="product"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                  {...formik.getFieldProps('productId')}
                >
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full">
                <label
                  htmlFor="store"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Store
                </label>
                <select
                  id="store"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                  {...formik.getFieldProps('storeId')}
                >
                  <option value="">Select Store</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="quantity"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Stock Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  {...formik.getFieldProps('quantity')}
                />
              </div>
              <div className="flex items-center gap-5">
                <button
                  type="submit"
                  className="inline-flex items-center px-5 py-2.5 mt-4 sm:mt-6 text-sm font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-primary-200 hover:bg-primary-800"
                >
                  Add stock
                </button>
                <Link
                  href={'/dashboard/stock'}
                  className="text-blue-700 mt-4 sm:mt-6 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-1.5 text-center"
                >
                  Back
                </Link>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default AddStock;
