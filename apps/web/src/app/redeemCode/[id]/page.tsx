'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { axiosInstance } from '@/lib/axios';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { availableStores } from '@/helpers/fetchStore';
import { TStore } from '@/models/store.model';

const EditAdmin = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { id } = params;
  const [initialValues, setInitialValues] = useState({
    name: '',
    email: '',
    password: '',
    storeId: '', // Menambahkan storeId
  });
  const [stores, setStores] = useState<TStore[]>([]); // State untuk daftar toko

  useEffect(() => {
    async function fetchDetail() {
      try {
        const response = await axiosInstance().get(`/admins/${id}`);
        const dataAdmin = response.data.data;
        console.log('====================================');
        console.log(dataAdmin);
        console.log('====================================');
        setInitialValues({
          name: dataAdmin.name,
          email: dataAdmin.email,
          password: dataAdmin.password,
          storeId: dataAdmin.Store[0]?.id || '', // Menetapkan storeId jika ada
        });
      } catch (error) {
        if (error instanceof AxiosError)
          console.error(
            'Error fetching admin details:',
            error.response?.data?.message,
          );
        else if (error instanceof Error) console.error('Error:', error.message);
      }
    }

    fetchDetail();
  }, [id]);

  useEffect(() => {
    async function fetchStores() {
      await availableStores(setStores);
    }

    fetchStores();
  }, []);

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: Yup.object().shape({
      name: Yup.string().required('Nama wajib diisi').min(5),
      email: Yup.string().required('Email wajib diisi').email(),
      password: Yup.string().required('Password wajib diisi').min(8),
      storeId: Yup.string().required('Store Location wajib diisi'), // Validasi untuk storeId
    }),
    onSubmit: async (values) => {
      try {
        const { data } = await axiosInstance().patch(`/admins/${id}`, values);
        alert(data.message);
        router.push('/dashboard/admin');
      } catch (error) {
        if (error instanceof AxiosError) alert(error.response?.data?.message);
        else if (error instanceof Error) console.log(error.message);
      }
    },
  });

  return (
    <>
      <section className="bg-[#f4f7fe] w-full h-lvh">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto">
          <div className="flex items-center mb-6 text-2xl font-semibold text-gray-900">
            Nama Toko
          </div>
          <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 ">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                Edit Admin
              </h1>
              <form
                className="space-y-4 md:space-y-4"
                onSubmit={formik.handleSubmit}
              >
                <div>
                  <label
                    htmlFor="name"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.name && formik.errors.name ? (
                    <div className="text-red-600 text-sm">
                      {formik.errors.name}
                    </div>
                  ) : null}
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Email
                  </label>
                  <input
                    type="text"
                    name="email"
                    id="email"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.email && formik.errors.email ? (
                    <div className="text-red-600 text-sm">
                      {formik.errors.email}
                    </div>
                  ) : null}
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.password && formik.errors.password ? (
                    <div className="text-red-600 text-sm">
                      {formik.errors.password}
                    </div>
                  ) : null}
                </div>
                <div>
                  <label
                    htmlFor="storeId"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Store Name
                  </label>
                  <select
                    name="storeId"
                    id="storeId"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    value={formik.values.storeId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <option value="">Select a location</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.name}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                  {formik.touched.storeId && formik.errors.storeId ? (
                    <div className="text-red-600 text-sm">
                      {formik.errors.storeId}
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center gap-5 pt-5">
                  <button
                    type="submit"
                    className="text-white bg-blue-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                  >
                    Edit
                  </button>
                  <Link
                    href={'/dashboard/admin'}
                    className="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-1.5 text-center"
                  >
                    Back
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default EditAdmin;
