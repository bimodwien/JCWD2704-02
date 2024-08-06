'use client';

import React, { useEffect, useState } from 'react';
import { IoMdHome } from 'react-icons/io';
import { IoStorefront, IoLogOutSharp } from 'react-icons/io5';
import { PiUsersThreeFill } from 'react-icons/pi';
import { FaUserAlt, FaStore } from 'react-icons/fa';
import { BiSolidCategory } from 'react-icons/bi';
import { RiShoppingBasket2Fill } from 'react-icons/ri';
import Link from 'next/link';
import { MdClose } from 'react-icons/md';

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
      <div className="w-full bg-white shadow-md p-4 flex justify-between items-center z-50 sticky top-0 lg:hidden">
        <h1 className="text-[#2B3674] font-bold font-poppins text-2xl">
          BBH STORE
        </h1>
        <button
          onClick={togglePopup}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          More
        </button>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          <div className="w-full flex justify-between items-center p-4 border-b-2">
            <h1 className="text-[#2B3674] font-bold font-poppins text-2xl">
              Menu
            </h1>
            <button onClick={togglePopup} className="text-2xl">
              <MdClose />
            </button>
          </div>
          <div className="flex flex-col gap-5 py-10 px-5 text-[#A3AED0] overflow-y-auto">
            <Link href={'/dashboard'} className={linkClasses('/dashboard')}>
              <IoMdHome className={iconClasses('/dashboard')} /> Dashboard
            </Link>
            <hr />
            <Link
              href={'/dashboard/product'}
              className={linkClasses(`/dashboard/product`)}
            >
              <IoStorefront className={iconClasses(`/dashboard/product`)} />{' '}
              Products
            </Link>
            <hr />
            <Link
              href={'/dashboard/category'}
              className={linkClasses(`/dashboard/category`)}
            >
              <BiSolidCategory className={iconClasses('/dashboard/category')} />{' '}
              Category
            </Link>
            <hr />
            <Link
              href={'/dashboard/admin'}
              className={linkClasses('/dashboard/admin')}
            >
              <PiUsersThreeFill className={iconClasses('/dashboard/admin')} />{' '}
              Admins
            </Link>
            <hr />
            <Link
              href={'/dashboard/store'}
              className={linkClasses('/dashboard/store')}
            >
              <FaStore className={iconClasses('/dashboard/store')} /> Store
            </Link>
            <hr />
            <Link
              href={'/dashboard/order'}
              className={linkClasses('/dashboard/order')}
            >
              <RiShoppingBasket2Fill
                className={iconClasses('/dashboard/order')}
              />{' '}
              Order
            </Link>
            <hr />
            <div className="flex items-center gap-3">
              <FaUserAlt /> Profile
            </div>
            <hr />
            <div className="flex items-center gap-3">
              <IoLogOutSharp /> Logout
            </div>
            <hr />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
