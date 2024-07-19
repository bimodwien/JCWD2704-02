'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { RxAvatar } from 'react-icons/rx';
import { axiosInstance } from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { Table } from 'flowbite-react';
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md';
import { useDebounce } from 'use-debounce';
import Link from 'next/link';
import { fetchStores } from '@/helpers/fetchStore';
import { TStore } from '@/models/store.model';

const StoreComponent = () => {
  const [search, setSearch] = useState('');
  const [stores, setStores] = useState<TStore[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [value] = useDebounce(search, 1000);
  const [isLastPage, setIsLastPage] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchStores(page, limit, value, setStores, setIsLastPage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, limit, value]);

  const handleEdit = (id: string) => {
    router.push(`/dashboard/store/edit/${id}`);
  };

  return (
    <>
      <section className="bg-[#F4F7FE] flex w-full top-[49px] left-[290px] h-lvh">
        <Sidebar />
        <div className="py-6 px-10 w-full flex flex-col min-h-screen">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-dm-sans text-base font-medium leading-6 text-left text-[#707EAE]">
                Dashboard/Store
              </div>
              <div className="font-dm-sans text-display-small font-bold text-left">
                Store
              </div>
            </div>
            <div className="flex items-center gap-10 bg-white px-10 py-2 rounded-full">
              <div className="flex gap-5 py-1">
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  className="bg-[#F4F7FE] rounded-full pl-5 py-1 font-dm-sans text-14px"
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Link
                  href={'/dashboard/store/add'}
                  className="bg-[#F4F7FE] px-3 text-[#2B3674] font-dm-sans text-14px font-bold rounded-full flex items-center"
                  passHref
                >
                  Add Store
                </Link>
              </div>
              <div>
                <RxAvatar className="h-7 w-7" />
              </div>
            </div>
          </div>
          <div className="flex-grow">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div role="status">
                  <svg
                    aria-hidden="true"
                    className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto pt-5">
                <Table>
                  <Table.Head>
                    <Table.HeadCell>no</Table.HeadCell>
                    <Table.HeadCell>name</Table.HeadCell>
                    <Table.HeadCell>City</Table.HeadCell>
                    <Table.HeadCell>Actions</Table.HeadCell>
                  </Table.Head>
                  <Table.Body className="divide-y">
                    {stores?.length > 0 ? (
                      stores?.map((store, index) => (
                        <Table.Row key={store.id} className="bg-white">
                          <Table.Cell>{index + 1}</Table.Cell>
                          <Table.Cell>{store.name}</Table.Cell>
                          <Table.Cell>{store.city}</Table.Cell>
                          <Table.Cell>
                            <button
                              onClick={() => handleEdit(store.id)}
                              className="font-medium text-green-600"
                            >
                              Edit
                            </button>
                            <button
                              // onClick={() => handleDelete(store.id)}
                              className="ml-3 font-medium text-red-600"
                            >
                              Delete
                            </button>
                          </Table.Cell>
                        </Table.Row>
                      ))
                    ) : (
                      <Table.Row className="bg-white">
                        <Table.Cell colSpan={4} className="text-center">
                          No stores found.
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </Table.Body>
                </Table>
              </div>
            )}
          </div>
          <div className="flex justify-center items-center gap-5 pb-14">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className={`flex items-center font-bold gap-1  px-5 py-1 rounded-full ${
                page === 1
                  ? 'bg-gray-400 text-gray-200'
                  : 'bg-[#11047A] text-white'
              }`}
            >
              <MdNavigateBefore /> Prev
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={isLastPage}
              className={`flex items-center font-bold gap-1 px-5 py-1 rounded-full ${
                isLastPage
                  ? 'bg-gray-400 text-gray-200'
                  : 'bg-[#11047A] text-white'
              }`}
            >
              Next <MdNavigateNext />
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default StoreComponent;
