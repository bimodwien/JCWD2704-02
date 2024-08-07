'use client';
import '../../dashboard.css';
import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { RxAvatar } from 'react-icons/rx';
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md';
import { fetchProduct, deleteProduct } from '@/helpers/fetchProduct';
import { useDebounce } from 'use-debounce';
import { TProduct } from '@/models/product';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { axiosInstance } from '@/lib/axios';
import Swal from 'sweetalert2';
import { productSrc } from '@/helpers/format';

const Store = () => {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<TProduct[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [value] = useDebounce(search, 1000);
  const router = useRouter();
  async function onClickEdit(id: string) {
    const axios = axiosInstance();
    try {
      const response = await axios.get(`/products/${id}`);
      router.push(`/dashboard/product/edit/${id}`);
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    fetchProduct(page, limit, value, setProducts);
  }, [page, limit, value]);
  const isLastPage = products.length < limit;
  function handleDelete(id: string) {
    Swal.fire({
      title: 'Are you sure you want to delete this product?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await deleteProduct(
            id,
            page,
            limit,
            value,
            setProducts,
          );
          Swal.fire({
            title: 'Deleted!',
            text: 'Your file has been deleted.',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6',
          });
        } catch (error) {
          Swal.fire({
            title: 'Error!',
            text: 'There was a problem deleting the product.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6',
          });
        }
      }
    });
  }
  return (
    <>
      <section className="bg-[#F4F7FE] flex w-full min-h-lvh top-[49px] left-[290px]">
        <Sidebar />
        <div className="py-6 px-10 w-full">
          {/* header, nanti dipisah component lagi */}
          <div className="flex justify-between items-center">
            {/* ini dikiri */}
            <div>
              <div className="font-dm-sans text-base font-medium leading-6 text-left text-[#707EAE]">
                Dashboard/Products
              </div>
              <div className="font-dm-sans text-display-small font-bold text-left">
                Products
              </div>
            </div>
            {/* ini dikanan */}
            <div className="flex items-center gap-10 bg-white px-10 py-2 rounded-full">
              <div className="flex gap-5 py-1">
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-[#F4F7FE] rounded-full pl-5 py-1 font-dm-sans text-14px"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Link
                  href={'/dashboard/product/add'}
                  className="flex items-center bg-[#F4F7FE] px-3 text-[#2B3674] font-dm-sans text-14px font-bold rounded-full"
                >
                  +Product
                </Link>
              </div>
              <div>
                <RxAvatar className="h-7 w-7" />
              </div>
            </div>
          </div>
          {/* content-utama */}
          <div className="py-2.5 flex justify-between gap-5 w-full">
            <div className="w-full">
              {/* <div>
                <img
                  src="/carousel.jpeg"
                  alt="carousel"
                  className="h-[500px] w-full rounded-xl"
                />
              </div> */}
              <div className="flex justify-between items-center py-8">
                <div className="font-dm-sans text-24px font-bold text-[#2B3674]">
                  All Products
                </div>
                <div className="font-bold text-customBlue text-14px items-center bg-white px-5 py-1 rounded-full">
                  Product & Category
                </div>
              </div>
              {/* card buat product */}
              <div className="w-full">
                <div className="grid grid-cols-5 gap-[45px] pb-5 w-full">
                  {products.map((product) => {
                    return (
                      <div
                        key={product.id}
                        className="w-full max-w-[280px] h-[355px] bg-white rounded-xl"
                      >
                        <div className="flex justify-center items-center py-5">
                          <img
                            src={`${productSrc}${product.ProductImage[0].id}`}
                            alt="sample"
                            className="h-[180px] w-[250px] rounded-xl"
                          />
                        </div>
                        <div className="flex justify-between items-center gap-1 px-4 pb-8">
                          <div>
                            <div className="font-dm-sans font-bold text-base text-[#1B2559] truncate w-[110px]">
                              {product.name}
                            </div>
                            <div className="font-dm-sans font-medium text-14px text-[#A3AED0] truncate w-[110px]">
                              {product.category
                                ? product.category.name
                                : 'Category'}
                            </div>
                          </div>
                          <div className="font-dm-sans font-bold text-base text-[#1B2559]">
                            IDR {product.price}
                          </div>
                        </div>
                        <div className="flex justify-between items-center px-4">
                          <button
                            className="text-base text-customBlue font-semibold"
                            onClick={() => {
                              handleDelete(product.id);
                            }}
                          >
                            Delete Product
                          </button>
                          <button
                            className="bg-[#11047A] text-white px-5 py-0.5 rounded-full font-semibold"
                            onClick={() => {
                              onClickEdit(product.id);
                            }}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-center items-center gap-5 pt-5">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className={`flex items-center font-bold gap-1  px-5 py-1 rounded-full ${page === 1 ? 'bg-gray-400 text-gray-200' : 'bg-[#11047A] text-white'}`}
                >
                  <MdNavigateBefore /> Prev
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={isLastPage}
                  className={`flex items-center font-bold gap-1 px-5 py-1 rounded-full ${isLastPage ? 'bg-gray-400 text-gray-200' : 'bg-[#11047A] text-white'}`}
                >
                  Next <MdNavigateNext />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Store;
