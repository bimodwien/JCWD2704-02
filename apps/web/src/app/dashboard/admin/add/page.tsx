'use client';
import React from 'react';
import Link from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { axiosInstance } from '@/lib/axios';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

const AddAdmin = () => {
  const router = useRouter();
  const initialValues = {
    name: '',
    email: '',
    password: '',
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
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: data.message,
          confirmButtonColor: '#3085d6',
        }).then(() => {
          router.push('/dashboard/admin');
        });
      } catch (error) {
        if (error instanceof AxiosError) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.message || 'Something went wrong',
          });
        } else if (error instanceof Error) console.log(error.message);
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
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    email
                  </label>
                  <input
                    type="text"
                    id="email"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    {...formik.getFieldProps('email')}
                  />
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
                </div>
                <div className="pt-1">
                  <label
                    htmlFor=""
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Store Location
                  </label>
                  <select
                    name=""
                    id=""
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  >
                    <option value="">Select a location</option>
                  </select>
                </div>
                <div className="flex items-center gap-5 pt-5">
                  <button
                    type="submit"
                    className=" text-white bg-blue-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                  >
                    Create an admin
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

export default AddAdmin;
