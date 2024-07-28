'use client';
import React, { useEffect, useState } from 'react';
import { IoSearchSharp } from 'react-icons/io5';
import { IoCartOutline } from 'react-icons/io5';
import { CgNotes } from 'react-icons/cg';
import { CgProfile } from 'react-icons/cg';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav
      className={`z-10 p-2 fixed transition-all duration-300 ${isScrolled ? 'bg-white' : 'bg-transparent'}`}
    >
      <div className="flex justify-between items-center">
        <div className="flex border rounded">
          <div className="p-1 bg-white">
            <IoSearchSharp />
          </div>
          <input
            placeholder="Search in Grocery"
            className="pl-2 outline-none w-48"
          />
        </div>
        <div className="flex space-x-3">
          <div className="p-1">
            <IoCartOutline />
          </div>
          <div className="p-1">
            <CgNotes />
          </div>
          <div className="p-1">
            <CgProfile />
          </div>
        </div>
      </div>
    </nav>
  );
};
