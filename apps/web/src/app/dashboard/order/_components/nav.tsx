'use client';

import React, { useEffect, useState } from 'react';
import { IoIosMore, IoMdHome } from 'react-icons/io';
import { IoStorefront, IoLogOutSharp } from 'react-icons/io5';
import { PiUsersThreeFill } from 'react-icons/pi';
import { FaUserAlt, FaStore } from 'react-icons/fa';
import { BiSolidCategory } from 'react-icons/bi';
import { RiShoppingBasket2Fill } from 'react-icons/ri';
import Link from 'next/link';
import { MdClose } from 'react-icons/md';
import Image from 'next/image';

const Navbar = () => {
  const [pathname, setPathName] = useState('');
  const [showPopup, setShowPopup] = useState(false);

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

  const togglePopup = () => setShowPopup(!showPopup);

  return (
    <>
      <div className="w-full bg-white shadow-md p-4 flex justify-between items-center z-50 sticky top-0">
        <a
          href="/dashboard"
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <Image src="/logo.png" width={40} height={40} alt="bbh store" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap ">
            BBH Store
          </span>
        </a>
        <a
          href="/dashboard/order"
          className="flex items-center space-x-3 rtl:space-x-reverse py-2  px-4 bg-blue-600 text-white rounded-xl"
        >
          <RiShoppingBasket2Fill className="text-lg" />
          <span className="self-center text-lg font-semibold whitespace-nowrap ">
            Back to order
          </span>
        </a>
      </div>
    </>
  );
};

export default Navbar;
