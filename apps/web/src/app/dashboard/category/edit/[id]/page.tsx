'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { axiosInstance } from '@/lib/axios';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { categorySrc } from '@/helpers/format';

const EditCategory = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { id } = params;
  const [initialValues, setInitialValues] = useState({ name: '' });
  const [imagePreview, setImagePreview] = useState<String | null>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const response = await axiosInstance().get(`/category/${id}`);
        const dataCategory = response.data.data;
        console.log('ini id category', dataCategory.id);

        setInitialValues({
          name: dataCategory.name,
        });
        if (dataCategory.image) {
          const imageUrl = `${categorySrc}${dataCategory.id}`;
          setImagePreview(imageUrl);
          console.log(imageUrl);
        }
      } catch (error) {
        if (error instanceof AxiosError) throw error.response?.data?.message;
        else if (error instanceof Error) console.log(error.message);
      }
    }
    fetchDetail();
  }, [id]);

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: Yup.object().shape({
      name: Yup.string().required('Nama category wajib diisi'),
    }),
    onSubmit: async (values) => {
      try {
        const { data } = await axiosInstance().patch(
          `/category/${id}`,
          values,
          { headers: { 'Content-Type': 'multipart/form-data' } },
        );
        Swal.fire({
          title: 'Success!',
          text: 'Category has been updated.',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#3085d6',
        }).then(() => {
          router.push('/dashboard/category');
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

  function handleImage() {
    if (imageRef.current?.files && imageRef.current?.files[0]) {
      const file = imageRef.current.files[0];
      setImagePreview(URL.createObjectURL(file));
      formik.setFieldValue('image', file);
    }
  }
  return (
    <>
      <section className="bg-[#F4F7FE] min-h-lvh">
        <div className="py-8 px-4 mx-auto max-w-2xl lg:py-16">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Edit a category
          </h2>
          <form onSubmit={formik.handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
              <div className="sm:col-span-2">
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

              <div className="col-span-full">
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {imagePreview ? (
                      <img
                        src={imagePreview as string}
                        alt="category images"
                        className="mb-4 w-32 object-cover"
                      />
                    ) : (
                      <svg
                        className="w-8 h-8 mb-4 text-gray-500 "
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                    )}
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">SVG, PNG, JPG</p>
                  </div>
                  <input
                    id="dropzone-file"
                    type="file"
                    className="hidden"
                    ref={imageRef}
                    onChange={handleImage}
                  />
                </label>
              </div>
            </div>
            <div className="flex gap-5 items-center">
              <button
                type="submit"
                className="inline-flex items-center px-5 py-2.5 mt-4 sm:mt-6 text-sm font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-primary-200 hover:bg-primary-800"
              >
                Edit category
              </button>
              <Link
                href={'/dashboard/category'}
                className="text-blue-700 mt-4 sm:mt-6 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-1.5 text-center"
              >
                Back
              </Link>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default EditCategory;
