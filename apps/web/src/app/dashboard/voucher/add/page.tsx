'use client';
import React, { useState, useEffect } from 'react';
import { Datepicker } from 'flowbite-react';
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
import Swal from 'sweetalert2';

const AddVoucher = () => {
  const router = useRouter();
  const initialValues = {
    productId: '',
    storeId: '',
    description: '',
    category: '',
    typeInput: '',
    value: 0,
    maxDiscount: 0,
    minTotalPurchase: 0,
    minTransaction: 0,
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
      storeId: Yup.string().required('Store wajib diisi'),
      description: Yup.string().required('Description wajib diisi'),
      category: Yup.string().required('Category wajib diisi'),
      typeInput: Yup.string(),
      value: Yup.number(),
      maxDiscount: Yup.number(),
      minTotalPurchase: Yup.number(),
      minTransaction: Yup.number(),
      startDate: Yup.date().required('Start Date wajib diisi'),
      endDate: Yup.date().required('End Date wajib diisi'),
      productId: Yup.string().when('category', {
        is: (category: string) => category === 'product',
        then: (schema) =>
          schema.required('Product is required for category product'),
        otherwise: (schema) => schema.notRequired(),
      }),
    }),
    onSubmit: async (values) => {
      try {
        const { startDate, endDate, ...restValues } = values;
        const formattedValues: Partial<
          Omit<typeof values, 'startDate' | 'endDate'>
        > & {
          startDate: string;
          endDate: string;
        } = {
          ...restValues,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        };
        if (formattedValues.category !== 'product') {
          delete formattedValues.productId;
        }
        const { data } = await axiosInstance().post(
          '/vouchers',
          formattedValues,
        );
        Swal.fire({
          title: 'Success!',
          text: data.message,
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#3085d6',
        }).then(() => {
          router.push('/dashboard/voucher');
        });
      } catch (error) {
        if (error instanceof AxiosError) {
          Swal.fire({
            title: 'Error!',
            text: error.response?.data?.message || 'Something went wrong',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#d33',
          });
        } else if (error instanceof Error) console.log(error.message);
      }
    },
  });

  return (
    <>
      <section className="bg-[#F4F7FE] min-h-lvh">
        <div className="py-8 px-4 mx-auto max-w-2xl lg:py-16">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Add a new Voucher
          </h2>
          <form onSubmit={formik.handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2 sm:gap=2">
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
                  <option value="">Select Product</option>
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
                  Store Name
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
                  {...formik.getFieldProps('category')}
                >
                  <option value="">Select Category</option>
                  <option value="shippingCost">Shipping Cost</option>
                  <option value="totalPurchase">Total Purchase</option>
                  <option value="product">Product</option>
                </select>
              </div>
              <div className="w-full">
                <label
                  htmlFor="type"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Tipe
                </label>
                <select
                  id="type"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                  {...formik.getFieldProps('typeInput')}
                >
                  <option value="">Select Type</option>
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
              <div className="sm:col-span-2">
                <label
                  htmlFor="minTransaction"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Minimal Transaction
                </label>
                <input
                  type="number"
                  id="minTransaction"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                  {...formik.getFieldProps('minTransaction')}
                />
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="minTotalPurchase"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Minimal Total Purchase
                </label>
                <input
                  type="number"
                  id="minTotalPurchase"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                  {...formik.getFieldProps('minTotalPurchase')}
                />
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="maxDiscount"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Max Discount
                </label>
                <input
                  type="number"
                  id="maxDiscount"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                  {...formik.getFieldProps('maxDiscount')}
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
                  Add voucher
                </button>
                <Link
                  href={'/dashboard/voucher'}
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

export default AddVoucher;
