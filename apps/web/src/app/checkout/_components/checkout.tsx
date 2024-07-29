'use client';
import { axiosInstance } from '@/lib/axios';
import React, { useEffect, useState } from 'react';
import { BiSolidDiscount } from 'react-icons/bi';
import { IoReceiptOutline } from 'react-icons/io5';
import { MdOutlinePayment } from 'react-icons/md';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { TAddress, TCart } from '@/models/cart.model';
import { formatPrice } from '@/helpers/format';
import Swal from 'sweetalert2';

const Checkout = () => {
  const [cartData, setCartData] = useState<TCart[]>([]);
  const [shippingAddress, setShippingAddress] = useState<TAddress | null>(null);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<'manual' | 'gateway'>(
    'manual',
  );
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
  }, [cartData]);

  const handlePaymentTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentType(e.target.value as 'manual' | 'gateway');
  };

  const createOrder = async (paidType: 'manual' | 'gateway') => {
    try {
      const response = await axiosInstance().post(`/order/${userId}`, {
        // addressId: shippingAddress?.id,
        addressId: 'clz5q65x40001qphbhrmsfq0a',
        paidType: paidType,
      });
      Swal.fire({
        title: 'Created!',
        text: 'Your order has been created.',
        icon: 'success',
      }).then(() => {
        if (paidType === 'manual') {
          const { data } = response.data;
          router.push(`/order/${data.invoice}`);
        } else if (paidType === 'gateway') {
          const { data } = response.data;
          router.push(`/order/${data.createdOrder.invoice}`);
        }
      });
    } catch (error) {
      console.error('Error creating order:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to create order.',
        icon: 'error',
      });
    }
  };

  const handleOrderNow = async () => {
    let paidType: 'manual' | 'gateway' = 'manual';
    if (paymentType === 'gateway') {
      paidType = 'gateway';
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes!',
    });

    if (result.isConfirmed) {
      createOrder(paidType);
    }
  };

  return (
    <div className="p-5 md:p-10 flex flex-col md:flex-row md:justify-between gap-5 md:gap-10 bg-gray-100">
      <div className="rounded-xl p-5 bg-white w-full overflow-hidden shadow-md border border-gray-200">
        <div className="flex flex-col gap-3 ">
          <div className="text-xl lg:text-2xl font-semibold flex gap-3 items-center border-b border-gray-300 pb-2">
            <IoReceiptOutline /> Order Details
          </div>
          <div className="flex flex-col gap-3">
            <div className="text-xl font-semibold">Shipping Method</div>
            <div className="flex flex-col lg:flex-row lg:justify-start w-full gap-2">
              <div className="rounded-xl border border-gray-400 p-3 lg:w-96">
                <div className="flex justify-between items-center font-semibold">
                  Store Address
                </div>
                <div className="text-sm">
                  {cartData.length > 0 && (
                    <div>
                      <span>{cartData[0].store?.name}, </span>
                      {cartData[0].store?.address}
                    </div>
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-gray-400 p-3 lg:w-96">
                <div className="flex justify-between items-center  font-semibold">
                  Your Address
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
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="text-xl font-semibold">Product List</div>
            <div className="flex flex-col gap-2 rounded-xl p-3 h-full max-h-60 overflow-x-auto">
              {cartData.map((cart) => (
                <div
                  key={cart.id}
                  className="flex justify-between items-center gap-2 text-sm border-b border-t-gray-400 pb-1"
                >
                  <div className="flex gap-2 items-center">
                    <div className="w-10 text-center text-xs">
                      {cart.quantity}x
                    </div>
                    <div
                      className="text-wrap overflow-hidden lg:w-96"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {cart.product.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-xl bg-white w-full md:w-[500px] h-full p-5 shadow-md border border-gray-200">
        <div className="flex flex-col gap-3">
          <div className="font-semibold text-2xl flex gap-3 items-center">
            <MdOutlinePayment />
            Payment
          </div>
          <hr />
          <div className="flex flex-col gap-3">
            <div className="text-xl font-semibold">Payment Method</div>
            <div className="flex flex-col gap-3">
              <div
                className={`border rounded-xl p-2 ${paymentType === 'manual' ? 'border-blue-500 bg-blue-50' : 'border-gray-400'}`}
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="manual"
                    checked={paymentType === 'manual'}
                    onChange={handlePaymentTypeChange}
                  />
                  <div className="flex flex-col">
                    <div className="font-semibold">Manual</div>
                    <div className="text-xs">
                      Transfer to our bank account & upload your payment proof
                    </div>
                  </div>
                </label>
              </div>
              <div
                className={`border rounded-xl p-2 ${paymentType === 'gateway' ? 'border-blue-500 bg-blue-50' : 'border-gray-400'}`}
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="gateway"
                    checked={paymentType === 'gateway'}
                    onChange={handlePaymentTypeChange}
                  />
                  <div className="flex flex-col">
                    <div className="font-semibold">Other</div>
                    <div className="text-sm flex gap-2">
                      <Image
                        src="/payment/gopay.svg"
                        alt="gopay"
                        width={32}
                        height={32}
                      />
                      <Image
                        src="/payment/ovo.svg"
                        alt="ovo"
                        width={32}
                        height={32}
                      />
                      <Image
                        src="/payment/bniva.svg"
                        alt="bni"
                        width={32}
                        height={32}
                      />
                      <Image
                        src="/payment/mandiriva.svg"
                        alt="mandiri"
                        width={32}
                        height={32}
                      />
                      <Image
                        src="/payment/alfamart.svg"
                        alt="alfamart"
                        width={32}
                        height={32}
                      />
                      <Image
                        src="/payment/indomaret.svg"
                        alt="indomaret"
                        width={32}
                        height={32}
                      />
                      <div className="rounded-full bg-gray-200 p-1 w-4 h-4 flex items-center">
                        +
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
          <hr />
          <div className="flex flex-col gap-2">
            <div className="text-xl font-semibold">Price Details</div>
            <div className="flex justify-between items-center font-semibold ">
              <span className="font-normal ">Subtotal</span>
              {formatPrice(totalPrice)}
            </div>
            <div className="flex justify-between items-center font-semibold ">
              <span className="font-normal ">Shipping</span>
              Rp XX.XXX
            </div>
            <div className="flex justify-between items-center font-semibold ">
              <span className="font-normal ">Discount</span>
              Rp XX.XXX
            </div>
            <hr />
            <div className="flex justify-between items-center font-semibold text-lg">
              <span className="">Total Payment</span>
              {formatPrice(totalPrice)}
            </div>
            <hr />
            <button className="flex justify-center w-full p-2 items-center gap-2 rounded-full border-2 border-blue-500 text-blue-700 font-semibold">
              <BiSolidDiscount className="text-2xl" />
              Apply Voucher
            </button>
            <button
              onClick={handleOrderNow}
              className="flex justify-center bg-blue-600 text-white text-lg rounded-full p-2 font-semibold"
            >
              Order Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
