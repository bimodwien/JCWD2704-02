import React from 'react';
import { ToastContainer } from 'react-toastify';
import Cart from './_components/cart';

const cart = () => {
  return (
    <>
      <main className="bg-gray-100 h-screen">
        <Cart />
        <ToastContainer />
      </main>
    </>
  );
};

export default cart;
