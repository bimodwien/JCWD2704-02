'use client';
import React, { useEffect, useState } from 'react';
import { LiaShippingFastSolid } from 'react-icons/lia';
import { FaChevronDown } from 'react-icons/fa';
import { axiosInstance } from '@/lib/axios';
import { IoCartOutline } from 'react-icons/io5';
import { useRouter } from 'next/navigation';
import { TAddress, TCart } from '@/models/cart.model';
import CartList from './cartItem';
import { formatPrice } from '@/helpers/format';
import Swal from 'sweetalert2';

const Cart = () => {
  const [cartData, setCartData] = useState<TCart[]>([]);
  const [shippingAddress, setShippingAddress] = useState<TAddress | null>(null);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [canCheckout, setCanCheckout] = useState<boolean>(true);
  const router = useRouter();

  const userId = 'clz5p3y8f0000ldvnbx966ss6';

  const fetchCart = async () => {
    try {
      const response = await axiosInstance().get(`/cart/${userId}`);
      const { data } = response.data;
      setCartData(data);
    } catch (error) {
      console.error('Error fetching cart data:', error);
    }
  };

  const fetchShippingAddress = async () => {
    try {
      const response = await axiosInstance().get(`/order/a/${userId}`);
      const { data } = response.data;
      setShippingAddress(data);
    } catch (error) {
      console.error('Error fetching shipping address:', error);
    }
  };

  useEffect(() => {
    fetchCart();
    fetchShippingAddress();
  }, []);

  const calculateTotalPrice = () => {
    let total = 0;
    cartData.forEach((item) => {
      if (item.quantity <= item.stock.quantity) {
        total += item.product.price * item.quantity;
      }
    });
    return total;
  };

  useEffect(() => {
    setTotalPrice(calculateTotalPrice());
    setTotalQuantity(cartData.reduce((acc, cart) => acc + cart.quantity, 0));

    const canCheckout = cartData.every(
      (item) => item.quantity <= item.stock.quantity,
    );
    setCanCheckout(canCheckout);
  }, [cartData]);

  const totalProduct = (quantity: number, price: number) => {
    return quantity * price;
  };

  const checkout = () => {
    if (canCheckout && shippingAddress) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'Please confirm that your shipping address and cart items are correct.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, proceed to checkout!',
      }).then((result) => {
        if (result.isConfirmed) {
          router.push('/checkout');
        }
      });
    } else {
      if (!shippingAddress) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Please add a shipping address before proceeding to checkout.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Unable to proceed to checkout. Please check your cart details.',
        });
      }
    }
  };

  return (
    <div className="p-5 md:p-10 flex flex-col md:flex-row md:justify-between gap-5 md:gap-10 bg-gray-100">
      <div className="rounded-xl bg-white w-full overflow-hidden shadow-md border border-gray-200">
        <div className="p-5 flex flex-col gap-3 ">
          <div className="text-xl lg:text-2xl font-semibold flex justify-between items-center border-b border-gray-300 pb-2">
            <div className="flex gap-3 items-center">
              <IoCartOutline /> Shopping Cart
            </div>
            <span className="font-semibold text-sm lg:text-base">
              {totalQuantity} {totalQuantity > 1 ? 'items' : 'item'}
            </span>
          </div>
          <CartList
            cartData={cartData}
            fetchCart={fetchCart}
            totalProduct={totalProduct}
          />
          {cartData.length === 0 && (
            <p className="text-center h-full">Your cart is empty</p>
          )}
        </div>
      </div>
      <div className="rounded-xl bg-white w-full md:w-[500px] h-full p-5 shadow-md border border-gray-200">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col bg-blue-100 rounded-xl border border-blue-400 p-4 gap-1 cursor-pointer">
            <div className="flex justify-between items-center text-blue-700 lg:text-lg ">
              <div className="flex gap-3 items-center font-semibold">
                <LiaShippingFastSolid className="text-2xl" />
                Shipping Address
              </div>
              <div className="text-lg">
                <FaChevronDown />
              </div>
            </div>
            <div className="text-sm">
              {shippingAddress?.address}
              {shippingAddress?.city && (
                <span className="text-sm">
                  , {''}
                  {shippingAddress.city.province},{' '}
                  {shippingAddress.city.cityName},{' '}
                  {shippingAddress.city.postalCode}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 border-t border-gray-300 pt-2">
            <div className="text-xl font-semibold">Price Details</div>
            <div className="flex justify-between items-center font-semibold ">
              <span className="font-normal ">Product</span>
              {formatPrice(totalPrice)}
            </div>
            <div className="flex justify-between items-center font-semibold ">
              <span className="font-normal ">Discount</span>
              Rp XX.XXX
            </div>
            <div className="flex justify-between items-center font-semibold text-lg  border-y border-gray-300 py-2">
              <span className="">Subtotal Price</span>
              {formatPrice(totalPrice)}
            </div>
            <button
              onClick={checkout}
              disabled={cartData.length === 0}
              className={`flex justify-center bg-blue-600 text-white text-lg rounded-full p-2 font-semibold ${cartData.length === 0 ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
