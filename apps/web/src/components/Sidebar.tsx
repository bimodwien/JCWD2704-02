'use client';

import React, { useEffect, useState } from 'react';
import { IoMdHome } from 'react-icons/io';
import { IoStorefront, IoLogOutSharp, IoTicketSharp } from 'react-icons/io5';
import { PiUsersThreeFill } from 'react-icons/pi';
import { FaUserAlt, FaStore } from 'react-icons/fa';
import { BiSolidCategory } from 'react-icons/bi';
import { MdDiscount } from 'react-icons/md';
import { BsBoxFill } from 'react-icons/bs';
import Link from 'next/link';

const Sidebar = () => {
  const [pathname, setPathName] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathName(window.location.pathname);
    }
  }, []);

  const linkClasses = (path: string) =>
    pathname === path
      ? 'flex items-center gap-3 font-bold text-[#2B3674] border-r-4 border-[#4318FF]'
      : 'flex items-center gap-3';

  const iconClasses = (path: string) =>
    pathname === path ? 'text-[#4318FF]' : '';

  return (
    <div className="w-[300px] bg-white">
      <h1 className="py-5 h-24 flex items-center justify-center border-b-4 text-[#2B3674] border-[#F4F7FE] font-bold font-poppins text-26px font-700 text-left">
        BBH <span className="font-normal">STORE</span>
      </h1>
      <div className="flex flex-col gap-10 py-10 pl-3 text-[#A3AED0]">
        <Link href={'/dashboard'} className={linkClasses('/dashboard')}>
          <IoMdHome className={iconClasses('/dashboard')} /> Dashboard
        </Link>
        <Link
          href={'/dashboard/product'}
          className={linkClasses(`/dashboard/product`)}
        >
          <IoStorefront className={iconClasses(`/dashboard/product`)} />
          Products
        </Link>
        <Link
          href={'/dashboard/category'}
          className={linkClasses(`/dashboard/category`)}
        >
          <BiSolidCategory className={iconClasses('/dashboard/category')} />
          Category
        </Link>
        <Link
          href={'/dashboard/admin'}
          className={linkClasses('/dashboard/admin')}
        >
          <PiUsersThreeFill className={iconClasses('/dashboard/admin')} />
          Admins
        </Link>
        <Link
          href={'/dashboard/store'}
          className={linkClasses('/dashboard/store')}
        >
          <FaStore className={iconClasses('/dashboard/store')} /> Store
        </Link>

        <Link
          href={'/dashboard/stock'}
          className={linkClasses('/dashboard/stock')}
        >
          <BsBoxFill className={iconClasses('/dashboard/stock')} /> Stock
        </Link>
        <Link
          href={'/dashboard/discount'}
          className={linkClasses('/dashboard/discount')}
        >
          <MdDiscount className={iconClasses('/dashboard/discount')} /> Discount
        </Link>
        <Link
          href={'/dashboard/voucher'}
          className={linkClasses('/dashboard/voucher')}
        >
          <IoTicketSharp className={iconClasses('/dashboard/voucher')} />{' '}
          Voucher
        </Link>
        <div className="flex items-center gap-3">
          <FaUserAlt /> Profile
        </div>
        <div className="flex items-center gap-3">
          <IoLogOutSharp /> Logout
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
