'use client';
import Sidebar from '@/components/Sidebar';
import React from 'react';
import Link from 'next/link';
import { RxAvatar } from 'react-icons/rx';
import { Table } from 'flowbite-react';

type Props = {};

function Discount({}: Props) {
  return (
    <section className="bg-[#F4F7FE] flex w-full top[49px] left-[290px] h-lvh">
      <Sidebar />
      <div className="py-6 px-10 w-full flex flex-col min-h-screen">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-dm-sans text-base font-medium leading-6 text-left text-[#707EAE]">
              Dashboard/Discount
            </div>
            <div className="font-dm-sans text-display-small font-bold text-left">
              Discount
            </div>
          </div>
          <div className="flex items-center gap-10 bg-white px-10 py-2 rounded-full">
            <div className="flex gap-5 py-1">
              <input
                type="text"
                className="bg-[#F4F7FE] rounded-full pl-5 py-1 font-dm-sans text-14px"
                placeholder="Search..."
              />
              <Link
                href={'/dashboard/discount/add'}
                className="bg-[#F4F7FE] px-3 text-[#2B3674] font-dm-sans text-14px font-bold rounded-full flex items-center"
              >
                +Discount
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
                <Table.HeadCell>Store Name</Table.HeadCell>
                <Table.HeadCell>Description</Table.HeadCell>
                <Table.HeadCell>Type</Table.HeadCell>
                <Table.HeadCell>Category</Table.HeadCell>
                <Table.HeadCell>Value</Table.HeadCell>
                <Table.HeadCell>Start From</Table.HeadCell>
                <Table.HeadCell>End Date</Table.HeadCell>
                <Table.HeadCell className="sr-only">edit</Table.HeadCell>
                <Table.HeadCell className="sr-only">delete</Table.HeadCell>
              </Table.Head>
            </Table>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Discount;
