'use client';
import '../../dashboard.css';
import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { RxAvatar } from 'react-icons/rx';
import Link from 'next/link';
import { Table } from 'flowbite-react';
import { TStockHistory } from '@/models/stockHistory';
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md';
import { useDebounce } from 'use-debounce';
import { fetchStockHistory } from '@/helpers/fetchStockHistory';

const StockHistory = () => {
  const [searchProduct, setSearchProduct] = useState('');
  const [searchStore, setSearchStore] = useState('');
  const [stockHistories, setStockHistories] = useState<TStockHistory[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [valueProduct] = useDebounce(searchProduct, 1000);
  const [valueStore] = useDebounce(searchStore, 1000);

  useEffect(() => {
    fetchStockHistory(page, limit, valueProduct, valueStore, setStockHistories);
  }, [page, limit, valueProduct, valueStore]);

  return (
    <>
      <section className="bg-[#F4F7FE] flex w-full h-lvh top-[49px] left-[290px]">
        <Sidebar />
        <div className="py-6 px-10 w-full flex flex-col min-h-screen">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-dm-sans text-base font-medium leading-6 text-left text-[#707EAE]">
                Dashboard/Stock History
              </div>
              <div className="font-dm-sans text-display-small font-bold text-left">
                Stock History
              </div>
            </div>
            <div className="flex items-center gap-10 bg-white px-10 py-2 rounded-full">
              <div className="flex gap-5 py-1">
                <input
                  type="text"
                  placeholder="Product..."
                  className="bg-[#F4F7FE] rounded-full pl-5 py-1 font-dm-sans text-14px"
                />
                <input
                  type="text"
                  placeholder="Store..."
                  className="bg-[#F4F7FE] rounded-full pl-5 py-1 font-dm-sans text-14px"
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
                  <Table.HeadCell>Reason</Table.HeadCell>
                  <Table.HeadCell>Stock Change</Table.HeadCell>
                  <Table.HeadCell>Stock</Table.HeadCell>
                  <Table.HeadCell className="sr-only">
                    <span>Edit</span>
                  </Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {Array.isArray(stockHistories) &&
                  stockHistories.length > 0 ? (
                    stockHistories.map((history, index) => {
                      return (
                        <Table.Row key={history.id} className="bg-white">
                          <Table.Cell>{index + 1}</Table.Cell>
                          <Table.Cell>{history.Product.name}</Table.Cell>
                          <Table.Cell>{history.Store.name}</Table.Cell>
                          <Table.Cell>{history.reason}</Table.Cell>
                          <Table.Cell>{history.quantityChange}</Table.Cell>
                          <Table.Cell>{history.Stock.quantity}</Table.Cell>
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
        </div>
      </section>
    </>
  );
};

export default StockHistory;
