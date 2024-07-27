'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { RxAvatar } from 'react-icons/rx';
import Link from 'next/link';
import { Table } from 'flowbite-react';
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md';
import { useDebounce } from 'use-debounce';
import { fetchStock } from '@/helpers/fetchStocks';
import { TStock } from '@/models/stock';

const Stock = () => {
  const [searchProduct, setSearchProduct] = useState('');
  const [searchStore, setSearchStore] = useState('');
  const [stocks, setStocks] = useState<TStock[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [valueProduct] = useDebounce(searchProduct, 1000);
  const [valueStore] = useDebounce(searchStore, 1000);

  useEffect(() => {
    fetchStock(page, limit, valueProduct, valueStore, setStocks);
  }, [page, limit, valueProduct, valueStore]);
  const isLastPage = stocks.length < limit;
  return (
    <>
      <section className="bg-[#F4F7FE] flex w-full h-lvh top-[49px] left-[290px]">
        <Sidebar />
        <div className="py-6 px-10 w-full flex flex-col min-h-screen">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-dm-sans text-base font-medium leading-6 text-left text-[#707EAE]">
                Dashboard/Stock
              </div>
              <div className="font-dm-sans text-display-small font-bold text-left">
                Stock
              </div>
            </div>
            <div className="flex items-center gap-10 bg-white px-10 py-2 rounded-full">
              <div className="flex gap-5 py-1">
                <input
                  type="text"
                  placeholder="Product..."
                  className="bg-[#F4F7FE] rounded-full pl-5 py-1 font-dm-sans text-14px"
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Store..."
                  className="bg-[#F4F7FE] rounded-full pl-5 py-1 font-dm-sans text-14px"
                  value={searchStore}
                  onChange={(e) => setSearchStore(e.target.value)}
                />
                <Link
                  href={'/dashboard/stock/add'}
                  className="flex items-center bg-[#F4F7FE] px-3 text-[#2B3674] font-dm-sans text-14px font-bold rounded-full"
                >
                  +Stock
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
                  <Table.HeadCell>Product Name</Table.HeadCell>
                  <Table.HeadCell>Store</Table.HeadCell>
                  <Table.HeadCell>Stock</Table.HeadCell>
                  <Table.HeadCell className="sr-only">
                    <span>Edit</span>
                  </Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {Array.isArray(stocks) && stocks.length > 0 ? (
                    stocks.map((stock, index) => {
                      return (
                        <Table.Row key={stock.id} className="bg-white">
                          <Table.Cell>{index + 1}</Table.Cell>
                          <Table.Cell>{stock.product.name}</Table.Cell>
                          <Table.Cell>{stock.store.name}</Table.Cell>
                          <Table.Cell>{stock.quantity}</Table.Cell>
                          <Table.Cell>
                            <Link
                              href={`/dashboard/stock/edit/${stock.id}`}
                              className="font-medium text-green-600"
                            >
                              Edit
                            </Link>
                          </Table.Cell>
                        </Table.Row>
                      );
                    })
                  ) : (
                    <Table.Row className="bg-white">
                      <Table.Cell colSpan={5} className="text-center">
                        No Stocks found
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table>
            </div>
          </div>
          <div className="flex justify-center items-center gap-5 pb-14">
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
      </section>
    </>
  );
};

export default Stock;
