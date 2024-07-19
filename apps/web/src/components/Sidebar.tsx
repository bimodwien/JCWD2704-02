import React from 'react';
import { IoMdHome } from 'react-icons/io';
import { IoStorefront, IoLogOutSharp } from 'react-icons/io5';
import { PiUsersThreeFill } from 'react-icons/pi';
import { FaUserAlt, FaStore } from 'react-icons/fa';
import Link from 'next/link';
type Props = {};

const Sidebar = (props: Props) => {
  return (
    <div className="w-[300px] bg-white">
      <h1 className="py-5 h-24 flex items-center justify-center border-b-4 text-[#2B3674] border-[#F4F7FE] font-bold font-poppins text-26px font-700 text-left">
        BBH <span className="font-normal">STORE</span>
      </h1>
      <div className="flex flex-col gap-10 py-10 pl-3 text-[#A3AED0]">
        <div className="flex items-center gap-3">
          <IoMdHome /> Dashboard
        </div>
        <Link
          href={'/dashboard/product'}
          className="flex items-center gap-3 font-bold text-[#2B3674] leading-7 tracking-[-2%] border-r-4 border-[#4318FF]"
        >
          <IoStorefront className="text-[#4318FF]" /> Products
        </Link>
        <Link href={'/dashboard/admin'} className="flex items-center gap-3">
          <PiUsersThreeFill /> Admins
        </Link>
        <Link href={'/dashboard/store'} className="flex items-center gap-3">
          <FaStore /> Store
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
