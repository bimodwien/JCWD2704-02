'use client';
import React, { useEffect, useState } from 'react';
import { Datepicker } from 'flowbite-react';
import Link from 'next/link';
import { fetchDetailVoucher } from '@/helpers/fetchVoucher';
import { TVoucher } from '@/models/voucher';

function DetailVoucher({ params }: { params: { id: string } }) {
  const { id } = params;
  const [vouchers, setVouchers] = useState<TVoucher | null>(null);

  useEffect(() => {
    fetchDetailVoucher(id, setVouchers);
  }, [id]);
  return (
    <>
      <section className="bg-[#F4F7FE] min-h-lvh">
        <div className="py-8 px-4 mx-auto max-w-2xl lg:py-16">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Voucher Detail
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap=2">
            <div className="w-full">
              <label
                htmlFor="product"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Product Name
              </label>
              <div className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5">
                {vouchers?.product?.name || 'Select Product'}
              </div>
            </div>
            <div className="w-full">
              <label
                htmlFor="store"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Store Name
              </label>
              <div className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5">
                {vouchers?.store.name || 'Select Store'}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="description"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Description
              </label>
              <div className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5">
                {vouchers?.description || 'Description'}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="category"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Category
              </label>
              <div className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5">
                {vouchers?.category || 'Select Category'}
              </div>
            </div>
            <div className="w-full">
              <label
                htmlFor="type"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Tipe
              </label>
              <div className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5">
                {vouchers?.typeInput || 'Select Type'}
              </div>
            </div>
            <div className="w-full">
              <label
                htmlFor="value"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Value
              </label>
              <div className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5">
                {vouchers?.value || 'Value'}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="minTransaction"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Minimal Transaction
              </label>
              <div className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5">
                {vouchers?.minTransaction || 'Minimal Transaction'}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="minTotalPurchase"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Minimal Total Purchase
              </label>
              <div className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5">
                {vouchers?.minTotalPurchase || 'Minimal Total Purchase'}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="maxDiscount"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Max Discount
              </label>
              <div className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5">
                {vouchers?.maxDiscount || 'Max Discount'}
              </div>
            </div>
            <div className="w-full">
              <label
                htmlFor="startDate"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Start Date
              </label>
              <div className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5">
                {vouchers
                  ? new Date(vouchers.startDate).toLocaleDateString()
                  : 'Start Date'}
              </div>
            </div>
            <div className="w-full">
              <label
                htmlFor="endDate"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                End Date
              </label>
              <div className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5">
                {vouchers
                  ? new Date(vouchers.endDate).toLocaleDateString()
                  : 'End Date'}
              </div>
            </div>
            <div className="flex items-center gap-5">
              <Link
                href={'/dashboard/voucher'}
                className="inline-flex items-center px-5 py-2.5 mt-4 sm:mt-6 text-sm font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-primary-200 hover:bg-primary-800"
              >
                Back
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default DetailVoucher;
