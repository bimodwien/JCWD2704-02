'use client';
import React, { useEffect, useState, useRef } from 'react';
import { LiaShippingFastSolid } from 'react-icons/lia';
import { FaChevronDown } from 'react-icons/fa';
import { axiosInstance } from '@/lib/axios';
import { IoCartOutline } from 'react-icons/io5';
import { useRouter } from 'next/navigation';
import { TAddress, TCart } from '@/models/cart.model';
import CartList from './cartItem';
import { formatPrice } from '@/helpers/format';
import Swal from 'sweetalert2';
import { MdOutlineStorefront } from 'react-icons/md';

const Cart = () => {
  const [cartData, setCartData] = useState<TCart[]>([]);
  const [shippingAddress, setShippingAddress] = useState<TAddress | null>(null);
  const [allAddresses, setAllAddresses] = useState<TAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [canCheckout, setCanCheckout] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);

  const fetchCart = async () => {
    try {
      const response = await axiosInstance().get(`/cart/a`);
      const { data } = response.data;
      setCartData(data);
    } catch (error) {
      console.error('Error fetching cart data:', error);
    }
  };

  const fetchShippingAddress = async (filter: 'all' | 'chosen') => {
    try {
      const response = await axiosInstance().get(`/order/a`, {
        params: { filter },
      });
      if (filter === 'all') {
        setAllAddresses(response.data.data);
      } else {
        setShippingAddress(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching shipping address:', error);
    }
  };

  useEffect(() => {
    fetchCart();
    fetchShippingAddress('chosen');
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      fetchShippingAddress('all');
    }
  }, [isModalOpen]);

  const seeAddress = () => {
    setIsModalOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  const handleAddressClick = (id: string) => {
    setSelectedAddressId(id);
  };

  const confirmAddressSelection = async () => {
    if (selectedAddressId) {
      try {
        await axiosInstance().patch('/cart/s', {
          addressId: selectedAddressId,
        });
        await fetchShippingAddress('chosen');
        await fetchCart();
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error confirming address selection:', error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Failed to update shipping address.',
        });
      }
    }
  };

  const calculateTotalPrice = () => {
    let total = 0;
    cartData.forEach((item) => {
      const itemPrice = item.stock?.priceDiscount ?? item.product.price;
      total += itemPrice * item.quantity;
    });
    return total;
  };

  useEffect(() => {
    setTotalPrice(calculateTotalPrice());
    setTotalQuantity(
      cartData.reduce((acc, cart) => acc + (cart.quantity || 0), 0),
    );

    const canCheckout = cartData.every(
      (item) => item.quantity <= (item.stock?.quantity ?? 0),
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
    <div className="p-5 md:p-10 flex flex-col md:flex-row md:justify-center gap-5 md:gap-10 bg-gray-100">
      <div className="rounded-xl p-5 bg-white w-full overflow-hidden shadow-md border border-gray-200 max-w-[900px]">
        <div className="flex flex-col gap-5">
          <div className="text-xl lg:text-2xl font-semibold flex justify-between items-center border-b border-gray-300 pb-2">
            <div className="flex gap-3 items-center">
              <IoCartOutline /> Shopping Cart
            </div>
            <span className="font-semibold text-sm lg:text-base">
              {totalQuantity} {totalQuantity > 1 ? 'items' : 'item'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MdOutlineStorefront className="text-base text-center" />
            Nearest store: {''}
            {cartData &&
              cartData.length > 0 &&
              cartData[0].store &&
              cartData[0].store.name}
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
          <div
            onClick={seeAddress}
            className="flex flex-col bg-blue-100 rounded-xl border border-blue-400 p-4 gap-1 cursor-pointer"
          >
            <div className="flex justify-between items-center text-blue-700 lg:text-lg ">
              <div className="flex gap-3 items-center font-semibold">
                <LiaShippingFastSolid className="text-2xl" />
                Shipping Address
              </div>
              <FaChevronDown className="text-lg" />
            </div>
            {shippingAddress && (
              <div className="text-sm">{shippingAddress.address}</div>
            )}
          </div>
          <div className="flex flex-col gap-2 border-t border-gray-300 pt-2">
            <div className="text-xl font-semibold">Price Details</div>
            <div className="flex justify-between items-center font-semibold ">
              <span className="font-normal ">Product</span>
              {formatPrice(totalPrice)}
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
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div
            className="bg-white p-3 rounded-lg shadow-lg w-[350px] h-[550px] relative flex justify-between items-center flex-col gap-3
            "
            ref={modalRef}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="text-lg font-semibold mb-3">Choose Addresses</div>
              {allAddresses.length > 0 ? (
                <div className="flex flex-col gap-3 p-2">
                  {allAddresses.map((address) => (
                    <div
                      key={address.id}
                      className={`text-sm rounded-xl border border-gray-300 p-2 cursor-pointer hover:border-blue-100 ${selectedAddressId === address.id ? 'bg-blue-100' : ''}`}
                      onClick={() => handleAddressClick(address.id)}
                    >
                      {address.address}
                      <span className="text-sm">
                        , {''}
                        {address.city}, {address.province}, {address.postalCode}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center">No addresses available</p>
              )}
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-lg font-semibold"
            >
              &times;
            </button>
            <button
              onClick={confirmAddressSelection}
              className="p-2 bg-blue-500 text-white rounded-xl w-20"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
