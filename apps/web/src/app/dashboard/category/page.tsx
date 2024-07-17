'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { RxAvatar } from 'react-icons/rx';
import { Table } from 'flowbite-react';
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md';
import { useDebounce } from 'use-debounce';
import { fetchCategory, deleteCategory } from '@/helpers/fetchCategory';
import { TCategory } from '@/models/category';
import { axiosInstance } from '@/lib/axios';
import { useRouter } from 'next/navigation';

const Category = () => {
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<TCategory[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [value] = useDebounce(search, 1000);
  const router = useRouter();

  async function onClickEdit(id: string) {
    const axios = axiosInstance();
    try {
      await axios.get(`/category/${id}`);
      router.push(`/dashboard/category/edit/${id}`);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchCategory(page, limit, value, setCategories);
  }, [page, limit, value]);

  const isLastPage = categories.length < limit;

  return (
    <>
      <section className="bg-[#F4F7FE] flex w-full top[49px] left-[290px] h-lvh">
        <Sidebar />
        <div className="py-6 px-10 w-full flex flex-col min-h-screen">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-dm-sans text-base font-medium leading-6 text-left text-[#707EAE]">
                Dashboard/Category
              </div>
              <div className="font-dm-sans text-display-small font-bold text-left">
                Category
              </div>
            </div>
            <div className="flex items-center gap-10 bg-white px-10 py-2 rounded-full">
              <div className="flex gap-5 py-1">
                <input
                  type="text"
                  className="bg-[#F4F7FE] rounded-full pl-5 py-1 font-dm-sans text-14px"
                  placeholder="Search..."
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Link
                  href={'/dashboard/category/add'}
                  className="bg-[#F4F7FE] px-3 text-[#2B3674] font-dm-sans text-14px font-bold rounded-full flex items-center"
                >
                  +Category
                </Link>
              </div>
              <div>
                <RxAvatar className="h-7 w-7" />
              </div>
            </div>
          </div>
          <div className="flex-grow">
            <div className="overflow-x-auto pt-5">
              <Table>
                <Table.Head>
                  <Table.HeadCell>No</Table.HeadCell>
                  <Table.HeadCell>Image</Table.HeadCell>
                  <Table.HeadCell>Name</Table.HeadCell>
                  <Table.HeadCell className="sr-only">
                    <span>delete</span>
                  </Table.HeadCell>
                  <Table.HeadCell className="sr-only">
                    <span>edit</span>
                  </Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {Array.isArray(categories) && categories.length > 0 ? (
                    categories.map((category, index) => {
                      return (
                        <Table.Row key={category.id} className="bg-white">
                          <Table.Cell>{index + 1}</Table.Cell>
                          <Table.Cell>
                            <img
                              src={`http://localhost:8000/category/images/${category.id}`}
                              alt="Image"
                              className="h-16 w-16"
                            />
                          </Table.Cell>
                          <Table.Cell>{category.name}</Table.Cell>
                          <Table.Cell
                            onClick={() => {
                              deleteCategory(
                                category.id,
                                page,
                                limit,
                                value,
                                setCategories,
                              );
                            }}
                            className="font-medium text-red-600 cursor-pointer"
                          >
                            Delete
                          </Table.Cell>
                          <Table.Cell className="font-medium text-green-600">
                            <button
                              onClick={() => {
                                onClickEdit(category.id);
                              }}
                            >
                              Edit
                            </button>
                          </Table.Cell>
                        </Table.Row>
                      );
                    })
                  ) : (
                    <Table.Row className="bg-white">
                      <Table.Cell colSpan={5} className="text-center">
                        No categories found
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table>
            </div>
          </div>
          <div className="flex justify-center items-center gap-5 pb-14">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className={`flex items-center font-bold gap-1  px-5 py-1 rounded-full ${page === 1 ? 'bg-gray-400 text-gray-200' : 'bg-[#11047A] text-white'}`}
            >
              <MdNavigateBefore /> Prev
            </button>
            <button
              disabled={isLastPage}
              onClick={() => setPage(page + 1)}
              className={`flex items-center font-bold gap-1 px-5 py-1 rounded-full ${isLastPage ? 'bg-gray-400 text-gray-200' : 'bg-[#11047A] text-white'}`}
            >
              Next <MdNavigateNext />
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Category;
