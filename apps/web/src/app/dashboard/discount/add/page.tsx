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
import { Datepicker } from 'flowbite-react';
import Swal from 'sweetalert2';

function AddDiscount() {
  const router = useRouter();
  const initialValues = {
    productId: '',
    storeId: '',
    description: '',
    categoryInput: '',
    typeInput: '',
    value: 0,
    startDate: new Date(),
    endDate: new Date(),
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
      storeId: Yup.string().required('Store wajib diisi'),
      description: Yup.string().required('Description wajib diisi'),
      categoryInput: Yup.string().required('Category wajib diisi'),
      typeInput: Yup.string(),
      value: Yup.number(),
      startDate: Yup.date().required('Start Date wajib diisi'),
      endDate: Yup.date().required('End Date wajib diisi'),
    }),
    onSubmit: async (values) => {
      try {
        const formattedValues = {
          ...values,
          startDate: values.startDate.toISOString(),
          endDate: values.endDate.toISOString(),
        };
        const { data } = await axiosInstance().post(
          '/discounts',
          formattedValues,
        );
        Swal.fire({
          title: 'Success!',
          text: data.message,
          icon: 'success',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK',
        }).then(() => {
          router.push(`/dashboard/discount`);
        });
      } catch (error) {
        if (error instanceof AxiosError) {
          Swal.fire({
            title: 'Error!',
            text: error.response?.data?.message,
            icon: 'error',
            confirmButtonColor: '#d33',
            confirmButtonText: 'OK',
          });
        } else if (error instanceof Error) {
          Swal.fire({
            title: 'Error!',
            text: error.message,
            icon: 'error',
            confirmButtonColor: '#d33',
            confirmButtonText: 'OK',
          });
        }
      }
    },
  });

  return (
    <>
      <section className="bg-[#F4F7FE] min-h-lvh">
        <div className="py-8 px-4 mx-auto max-w-2xl lg:py-16">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Add new Discount
          </h2>
          <form onSubmit={formik.handleSubmit}>
            <div className="grid gap-8 sm:grid-cols-2 sm:gap=2">
              <div className="w-full">
                <label
                  className="block mb-2 text-sm font-medium text-gray-900"
                  htmlFor="product"
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
                  <option value="">Select store</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="description"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                  {...formik.getFieldProps('description')}
                />
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="category"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Category
                </label>
                <select
                  id="category"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                  {...formik.getFieldProps('categoryInput')}
                >
                  <option value="">Select category</option>
                  <option value="buyGet">Buy Get</option>
                  <option value="discount">Discount</option>
                </select>
              </div>
              <div className="w-full">
                <label
                  htmlFor="type"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Tipe Discount
                </label>
                <select
                  id="type"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                  {...formik.getFieldProps('typeInput')}
                >
                  <option value="">Select type</option>
                  <option value="percentage">Percentage</option>
                  <option value="nominal">Nominal</option>
                </select>
              </div>
              <div className="w-full">
                <label
                  htmlFor="value"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Value
                </label>
                <input
                  type="number"
                  id="value"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                  {...formik.getFieldProps('value')}
                />
              </div>
              <div className="w-full">
                <label
                  htmlFor="startDate"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Start Date
                </label>
                <Datepicker
                  id="startDate"
                  name="startDate"
                  value={formik.values.startDate.toISOString().split('T')[0]}
                  onSelectedDateChanged={(date) =>
                    formik.setFieldValue('startDate', date)
                  }
                />
              </div>
              <div className="w-full">
                <label
                  htmlFor="endDate"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  End Date
                </label>
                <Datepicker
                  id="endDate"
                  name="endDate"
                  value={formik.values.endDate.toISOString().split('T')[0]}
                  onSelectedDateChanged={(date) =>
                    formik.setFieldValue('endDate', date)
                  }
                />
              </div>
              <div className="flex items-center gap-5">
                <button
                  type="submit"
                  className="inline-flex items-center px-5 py-2.5 mt-4 sm:mt-6 text-sm font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-primary-200 hover:bg-primary-800"
                >
                  Add discount
                </button>
                <Link
                  href={'/dashboard/discount'}
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
}

export default AddDiscount;
