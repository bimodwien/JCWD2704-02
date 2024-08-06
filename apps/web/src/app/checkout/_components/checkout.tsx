'use client';
import { axiosInstance } from '@/lib/axios';
import React, { useEffect, useRef, useState } from 'react';
import { IoReceiptOutline, IoTimeOutline } from 'react-icons/io5';
import { TAddress, TCart } from '@/models/cart.model';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import PaymentMethod from './payment';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { formatPrice } from '@/helpers/format';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import ShippingDetails from './shipping';

const Checkout = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [userVouchers, setUserVouchers] = useState<any[]>([]);
  const [productVouchers, setProductVouchers] = useState<any[]>([]);
  const [cartData, setCartData] = useState<TCart[]>([]);
  const [shippingAddress, setShippingAddress] = useState<TAddress | null>(null);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<
    'manual' | 'gateway' | undefined
  >();
  const [selectedVoucher, setSelectedVoucher] = useState<any | null>(null);
  const router = useRouter();
  dayjs.extend(relativeTime);

  const fetchCart = async () => {
    try {
      const response = await axiosInstance().get(`/cart/a`);
      const { data } = response.data;
      setCartData(data);
    } catch (error) {
      console.error('Error fetching cart data:', error);
    }
  };

  const fetchShippingAddress = async () => {
    try {
      const response = await axiosInstance().get(`/order/a`, {
        params: { filter: 'chosen' },
      });
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
      const stockQuantity = item.stock?.quantity ?? 0;
      const productPrice = item.product.price;
      const quantity = item.quantity;

      const price = item.stock?.priceDiscount
        ? item.stock.priceDiscount * quantity
        : productPrice * quantity;

      if (quantity <= stockQuantity) {
        total += price;
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
      const response = await axiosInstance().post(`/order/`, {
        addressId: shippingAddress?.id,
        paidType: paidType,
        voucherId: selectedVoucher?.id,
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
    let paidType: 'manual' | 'gateway' =
      paymentType === 'gateway' ? 'gateway' : 'manual';

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

  const fetchVoucher = async () => {
    try {
      const response = await axiosInstance().get(`/cart/voucher`);
      const { userVouchers, productVouchers } = response.data.data;
      setUserVouchers(userVouchers);
      setProductVouchers(productVouchers);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      fetchVoucher();
    }
  }, [isModalOpen]);

  const toggleVoucherModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleVoucherClick = (voucher: any) => {
    setSelectedVoucher(voucher);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsModalOpen(false);
        setSelectedVoucher(null);
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  const reset = () => {
    if (isModalOpen) {
      setSelectedVoucher(null);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="p-5 md:p-10 flex flex-col md:flex-row md:justify-center gap-5 md:gap-10 bg-gray-100">
      <div className="rounded-xl p-5 bg-white w-full overflow-hidden shadow-md border border-gray-200 max-w-[900px]">
        <div className="flex flex-col gap-5">
          <div className="text-xl lg:text-2xl font-semibold flex gap-3 items-center border-b border-gray-300 pb-2">
            <IoReceiptOutline /> Order Details
          </div>
          <ShippingDetails
            cartData={cartData}
            shippingAddress={shippingAddress}
          />
          <div className="flex flex-col gap-3">
            <div className="text-xl font-semibold">Product List</div>
            <div className="flex flex-col gap-2 rounded-xl p-3 h-full max-h-60 overflow-x-auto">
              {cartData.map((cart) => (
                <div
                  key={cart.id}
                  className="flex justify-between items-center gap-2 border-b border-t-gray-400 pb-1"
                >
                  <div className="flex gap-2 items-center">
                    <div className="w-10 text-center text-sm">
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
      <PaymentMethod
        seeVoucher={toggleVoucherModal}
        paymentType={paymentType}
        handlePaymentTypeChange={handlePaymentTypeChange}
        totalPrice={totalPrice}
        handleOrderNow={handleOrderNow}
        selectedVoucher={selectedVoucher}
      />

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div
            className="bg-white p-5 rounded-lg shadow-lg w-[350px] h-[550px] relative"
            ref={modalRef}
          >
            <div className="flex justify-between items-center flex-col gap-3 h-full overflow-auto">
              <div className="flex flex-col items-center gap-3  w-72 ">
                <div className="text-lg font-semibold mb-3">Choose Voucher</div>
                <div className="flex flex-col gap-5 ">
                  {productVouchers.length > 0 && (
                    <div className="flex flex-col gap-3 w-72 ">
                      <div className="font-semibold">Product Vouchers</div>
                      {productVouchers.map((voucher) => (
                        <div
                          key={voucher.id}
                          className={`text-sm rounded-xl border border-gray-300 hover:border-blue-500 p-2 cursor-pointer flex flex-col gap-1 ${
                            selectedVoucher?.id === voucher.id
                              ? 'bg-blue-100'
                              : ''
                          }`}
                          onClick={() => handleVoucherClick(voucher)}
                        >
                          <div className="flex justify-between gap-2 items-center">
                            <div className="font-semibold">
                              {voucher.voucherCode}
                            </div>
                            <div className="flex items-center gap-1 text-gray-500">
                              <IoTimeOutline />
                              {dayjs(voucher.endDate).format('DD MMM YYYY')}
                            </div>
                          </div>
                          <div>{voucher.description}</div>
                          <div>
                            {voucher.maxDiscount
                              ? `Max discount ${formatPrice(voucher.maxDiscount)}`
                              : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {userVouchers.length > 0 ? (
                    <div className="flex flex-col gap-3 w-72 ">
                      <div className="font-semibold">User Vouchers</div>
                      {userVouchers.map((voucher) => (
                        <div
                          key={voucher.id}
                          className={`text-sm rounded-xl border border-gray-300 hover:border-blue-500 p-2 cursor-pointer flex flex-col gap-1 ${
                            selectedVoucher?.id === voucher.id
                              ? 'bg-blue-100'
                              : ''
                          }`}
                          onClick={() => handleVoucherClick(voucher)}
                        >
                          <div className="flex justify-between gap-2 items-center">
                            <div className="font-semibold">
                              {voucher.voucher.voucherCode}
                            </div>
                            <div className="flex items-center gap-1 text-gray-500">
                              <IoTimeOutline />
                              {dayjs(voucher.voucher.endDate).format(
                                'DD MMM YYYY',
                              )}
                            </div>
                          </div>
                          <div>{voucher.voucher.description}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <></>
                  )}
                  {productVouchers.length === 0 &&
                    userVouchers.length === 0 && (
                      <div className="text-center">
                        No user vouchers available
                      </div>
                    )}
                </div>
              </div>
              <button
                onClick={toggleVoucherModal}
                className="absolute top-5 right-5 text-lg font-semibold"
              >
                <IoIosCloseCircleOutline />
              </button>
              <div className="w-full bg-white sticky bottom-0 gap-2 flex justify-center pt-3">
                <button
                  onClick={reset}
                  className="p-2 bg-red-500 text-white rounded-xl w-20"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 bg-blue-500 text-white rounded-xl w-20"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
