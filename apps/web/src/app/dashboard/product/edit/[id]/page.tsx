'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { axiosInstance } from '@/lib/axios';
import { AxiosError } from 'axios';
import { fetchCategory } from '@/helpers/fetchCategory';
import { TCategory } from '@/models/category';
import { useRouter } from 'next/navigation';

const EditProduct = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { id } = params;
  const [initialValues, setInitialValues] = useState({
    name: '',
    price: 0,
    weight: 0,
    description: '',
    categoryId: '',
  });
  const [imagePreview, setImagePreview] = useState<String | null>(null);
  const [categories, setCategories] = useState<TCategory[]>([]);
  const imageRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    async function fetchDetail() {
      try {
        const response = await axiosInstance().get(`/products/${id}`);
        const dataProduct = response.data.data;
        setInitialValues({
          name: dataProduct.name,
          price: dataProduct.price,
          weight: dataProduct.weight,
          description: dataProduct.description,
          categoryId: dataProduct.category ? dataProduct.category.id : '',
        });
        if (dataProduct.ProductImage && dataProduct.ProductImage.length > 0) {
          const images =
            'http://localhost:8000/products/images/' +
            dataProduct.ProductImage[0].id;
          console.log(images);

          setImagePreview(images);
        }
      } catch (error) {
        if (error instanceof AxiosError) throw error.response?.data?.message;
        else if (error instanceof Error) console.log(error.message);
      }
    }
    async function fetchCategories() {
      await fetchCategory(1, 10, '', setCategories);
    }
    fetchDetail();
    fetchCategories();
  }, [id]);
  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: Yup.object().shape({
      name: Yup.string().required('Name Product wajib diisi'),
      price: Yup.number().required('Price wajib diisi'),
      weight: Yup.number().required('Weight wajib diisi'),
      description: Yup.string().required('Description wajib diisi'),
      categoryId: Yup.string().required('Category wajib diisi'),
    }),
    onSubmit: async (values) => {
      try {
        const { data } = await axiosInstance().patch(
          `/products/${id}`,
          values,
          { headers: { 'Content-Type': 'multipart/form-data' } },
        );
        alert(data.message);
        router.push('/dashboard/product');
      } catch (error) {
        if (error instanceof AxiosError) alert(error.response?.data?.message);
        else if (error instanceof Error) console.log(error.message);
      }
    },
  });

  function handleImage() {
    if (imageRef.current?.files && imageRef.current?.files[0]) {
      const file = imageRef.current.files[0];
      setImagePreview(URL.createObjectURL(file));

      formik.setFieldValue('image', file);
      console.log('file selected: ', file);
      console.log('image product: ', URL.createObjectURL(file));
    }
  }
  return (
    <>
      <section className="bg-[#f4f7fe]">
        <div className="py-8 px-4 mx-auto max-w-2xl lg:py-16">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            Edit a product
          </h2>
          <form onSubmit={formik.handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
              <div className="sm:col-span-2">
                <label
                  htmlFor="name"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  placeholder="Type product name"
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
              <div className="w-full">
                <label
                  htmlFor="brand"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Stock
                </label>
                <input
                  type="number"
                  name="brand"
                  id="brand"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  placeholder="10"
                />
              </div>
              <div className="w-full">
                <label
                  htmlFor="price"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  id="price"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  placeholder="10000"
                  value={formik.values.price}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.price && formik.errors.price ? (
                  <div className="text-red-600 text-sm">
                    {formik.errors.price}
                  </div>
                ) : null}
              </div>
              <div>
                <label
                  htmlFor="category"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Category
                </label>
                <select
                  id="category"
                  name="categoryId"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                  value={formik.values.categoryId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="">Select category</option>
                  {categories.map((category: { id: string; name: string }) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="weight"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Item Weight
                </label>
                <input
                  type="number"
                  name="weight"
                  id="weight"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  placeholder="12"
                  value={formik.values.weight}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.weight && formik.errors.weight ? (
                  <div className="text-red-600 text-sm">
                    {formik.errors.weight}
                  </div>
                ) : null}
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="description"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={8}
                  className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Your description here"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                ></textarea>
                {formik.touched.description && formik.errors.description ? (
                  <div className=" text-red-600 text-sm">
                    {formik.errors.description}
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
                        alt="Product Images"
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
                Edit product
              </button>
              <Link
                href={'/dashboard/product'}
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

export default EditProduct;
