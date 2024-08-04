'use client';
import Sidebar from '@/components/Sidebar';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { RxAvatar } from 'react-icons/rx';
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md';
import { Table } from 'flowbite-react';
import { TDiscount } from '@/models/discount';
import { useDebounce } from 'use-debounce';
import { fetchDiscount, deleteDiscount } from '@/helpers/fetchDiscount';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

function Discount() {
  const [searchProduct, setSearchProduct] = useState('');
  const [searchStore, setSearchStore] = useState('');
  const [discounts, setDiscounts] = useState<TDiscount[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [valueProduct] = useDebounce(searchProduct, 1000);
  const [valueStore] = useDebounce(searchStore, 1000);

  useEffect(() => {
    fetchDiscount(page, limit, valueProduct, valueStore, setDiscounts);
  }, [page, limit, valueProduct, valueStore]);

  const isLastPage = discounts.length < limit;

  function handleDelete(id: string) {
    Swal.fire({
      title: 'Are you sure you want to delete this discount?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#EF5A6F',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteDiscount(
            id,
            page,
            limit,
            valueProduct,
            valueStore,
            setDiscounts,
          );
          Swal.fire({
            title: 'Deleted!',
            text: 'Discount has been deleted.',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6',
          });
        } catch (error) {
          Swal.fire({
            title: 'Error!',
            text: 'There was a problem deleting the discount.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#EF5A6F',
          });
        }
      }
    });
  }
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
                placeholder="Product..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
              />
              <input
                type="text"
                className="bg-[#F4F7FE] rounded-full pl-5 py-1 font-dm-sans text-14px"
                placeholder="Store..."
                value={searchStore}
                onChange={(e) => setSearchStore(e.target.value)}
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
                <Table.HeadCell className="sr-only">delete</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {Array.isArray(discounts) && discounts.length > 0 ? (
                  discounts.map((discount, index) => {
                    return (
                      <Table.Row key={discount.id} className="bg-white">
                        <Table.Cell>{index + 1}</Table.Cell>
                        <Table.Cell>{discount.product.name}</Table.Cell>
                        <Table.Cell>{discount.store.name}</Table.Cell>
                        <Table.Cell>{discount.description}</Table.Cell>
                        <Table.Cell>
                          {discount.type ? discount.type : '-'}
                        </Table.Cell>
                        <Table.Cell>{discount.category}</Table.Cell>
                        <Table.Cell>
                          {discount.value ? discount.value : '-'}
                        </Table.Cell>
                        <Table.Cell>
                          {dayjs(discount.startDate).format('YYYY-MM-DD')}
                        </Table.Cell>
                        <Table.Cell>
                          {dayjs(discount.endDate).format('YYYY-MM-DD')}
                        </Table.Cell>
                        <Table.Cell
                          className="font-medium text-red-600 cursor-pointer"
                          onClick={() => handleDelete(discount.id)}
                        >
                          Delete
                        </Table.Cell>
                      </Table.Row>
                    );
                  })
                ) : (
                  <Table.Row className="bg-white">
                    <Table.Cell colSpan={10} className="text-center">
                      No Discount found
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
  );
}

export default Discount;
