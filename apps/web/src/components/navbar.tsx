'use client';
import React, { useEffect, useRef, useState } from 'react';
import { IoCartOutline, IoReceiptOutline } from 'react-icons/io5';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { axiosInstance } from '@/lib/axios';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userPhotoRef = useRef<HTMLButtonElement>(null);
  const [sumCart, setSumCart] = useState(0);
  const pathname = usePathname();

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      userPhotoRef.current &&
      !userPhotoRef.current.contains(event.target as Node)
    ) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchCart = async () => {
    try {
      const response = await axiosInstance().get(`/carts/t`);
      const { data } = response.data;
      setSumCart(data);
    } catch (error) {
      console.error('Error fetching cart data:', error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [pathname]);

  return (
    <nav className="border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-screen flex flex-wrap items-center justify-between mx-5 md:mx-10 py-5">
        <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <span className="self-center text-2xl font-semibold whitespace-nowrap ">
            BBH Store
          </span>
        </a>
        <div
          className="items-center justify-between hidden w-full md:flex md:w-auto "
          id="navbar-user"
        >
          {/* <SearchOnNavbar /> */}
        </div>

        <div className="flex justify-end items-center gap-5 ">
          <Link href="/cart">
            <div className="relative">
              <IoCartOutline className="text-2xl" />
              {sumCart > 0 && (
                <span
                  className={`absolute ${
                    sumCart > 99 ? '-right-4 w-8 h-8' : '-right-3 w-6 h-6 '
                  } -top-3 bg-red-500 text-white border-2 font-semibold border-white rounded-full flex items-center justify-center text-xs`}
                >
                  {sumCart > 99 ? '+99' : sumCart}
                </span>
              )}
            </div>
          </Link>
          <Link href="/order">
            <IoReceiptOutline className="text-xl" />
          </Link>
          <div className="flex items-center gap-2 ">
            <button
              ref={userPhotoRef}
              type="button"
              onClick={toggleDropdown}
              className="flex text-sm bg-gray-500 rounded-full border-gray-200 border-4"
              id="user-menu-button"
              aria-expanded={isDropdownOpen ? 'true' : 'false'}
            >
              <span className="sr-only">Open user menu</span>
              <img
                className="w-8 h-8 rounded-full"
                src="https://t4.ftcdn.net/jpg/03/49/49/79/360_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.webp"
                alt="user photo"
              />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
