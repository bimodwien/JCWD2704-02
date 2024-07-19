'use client';
import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { axiosInstance } from '@/lib/axios';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { Loader } from '@googlemaps/js-api-loader';

const AddAdmin = () => {
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);

  const initialValues = {
    name: '',
    email: '',
    password: '',
    address: '',
  };

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object().shape({
      name: Yup.string().required('Nama wajib diisi').min(5),
      email: Yup.string().required('Email wajib diisi').email(),
      password: Yup.string().required('Password wajib diisi').min(8),
    }),
    onSubmit: async (values) => {
      try {
        const { data } = await axiosInstance().post('/admins', values);
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
          <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                Add Admin
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
                    id="name"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    {...formik.getFieldProps('name')}
                  />
                  {formik.touched.name && formik.errors.name ? (
                    <div className="text-red-500">{formik.errors.name}</div>
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
                    id="email"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    {...formik.getFieldProps('email')}
                  />
                  {formik.touched.email && formik.errors.email ? (
                    <div className="text-red-500">{formik.errors.email}</div>
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
                    id="password"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    {...formik.getFieldProps('password')}
                  />
                  {formik.touched.password && formik.errors.password ? (
                    <div className="text-red-500">{formik.errors.password}</div>
                  ) : null}
                </div>
                <button
                  type="submit"
                  className="text-white bg-blue-700 rounded-lg p-2"
                >
                  Add Admin
                </button>
                <Link
                  href="/dashboard/admin"
                  className="w-full text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Cancel
                </Link>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AddAdmin;
