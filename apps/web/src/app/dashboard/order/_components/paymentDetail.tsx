import React from 'react';
import Swal from 'sweetalert2';
import { formatPrice } from '@/helpers/format';
import { axiosInstance } from '@/lib/axios';
import { TOrder } from '@/models/order.model';
import Image from 'next/image';

interface PriceDetailsProps {
  order: TOrder | null;
  seeProof: () => void;
  onConfirm: () => void;
}

const PaymentOrder: React.FC<PriceDetailsProps> = ({
  order,
  seeProof,
  onConfirm,
}) => {
  if (!order) return null;
  const calculateSubtotal = (): number => {
    return order.OrderItem.reduce((total, item) => total + item.price, 0);
  };

  const subtotal = calculateSubtotal();
  const handleCheck = async (check: 'deny' | 'confirm') => {
    const confirmationMessage =
      check === 'deny'
        ? 'Are you sure you want to deny the payment?'
        : 'Are you sure you want to approve the payment?';

    const result = await Swal.fire({
      title: 'Confirm Action',
      text: confirmationMessage,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance().patch(`/order/cp/${order.id}`, { check });
        Swal.fire(
          'Success',
          `Payment has been ${check}ed successfully.`,
          'success',
        );
        onConfirm();
      } catch (error) {
        console.error(`Failed to ${check} the order:`, error);
        Swal.fire('Error', `Failed to ${check} the payment.`, 'error');
      }
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="text-lg lg:text-xl font-semibold">
          Payment Method -{' '}
          {order.paidType === 'manual'
            ? 'Manual'
            : order.paidType === 'gateway'
              ? 'Other'
              : ''}
        </div>
        {(order.paidType === 'manual' && order.status === 'waitingPayment') ||
          (order.status === 'waitingConfirmation' && (
            <div className="rounded-xl border border-blue-500 bg-blue-50 p-3 flex flex-col gap-1">
              <div className="flex flex-col items-center font-semibold justify-center">
                BANK ACCOUNT
                <span className="font-semibold text-red-700 flex justify-center gap-2">
                  10923874651928
                </span>
              </div>
              <div className="flex justify-center gap-2 items-center">
                Merchant Name: <span className="font-semibold">BBH Store</span>
              </div>
            </div>
          ))}
        {order.paidType === 'gateway' && (
          <div className="text-sm flex gap-2">
            <Image
              src="/payment/gopay.svg"
              alt="gopay"
              width={32}
              height={32}
            />
            <Image src="/payment/ovo.svg" alt="ovo" width={32} height={32} />
            <Image src="/payment/bniva.svg" alt="bni" width={32} height={32} />
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
        )}
      </div>
      <hr />
      <div className="flex flex-col gap-2">
        <div className="text-lg lg:text-xl font-semibold">Price Details</div>
        <div className="flex justify-between items-center font-semibold ">
          <span className="font-normal ">Subtotal</span>
          {formatPrice(subtotal)}
        </div>
        <div className="flex justify-between items-center font-semibold ">
          <span className="font-normal ">Shipping</span>
          {formatPrice(order.shippingCost)}
        </div>
        {order.discountPrice > 0 && (
          <div className="flex justify-between items-center font-semibold ">
            <span className="font-normal ">Voucher</span>-
            {formatPrice(order.discountPrice)}
          </div>
        )}
        <hr />

        <div className="flex justify-between items-center font-semibold text-lg">
          <span className="">Total Payment</span>
          {formatPrice(order.totalPrice)}
        </div>
      </div>
      {order.paidType === 'manual' && order.paidAt && (
        <>
          <hr />
          <button
            onClick={seeProof}
            className="flex justify-center w-full p-2 items-center gap-2 rounded-full border-2 border-blue-500 text-blue-700 font-semibold bg-blue-50 hover:bg-blue-100"
          >
            See Payment Proof
          </button>
        </>
      )}
      {order.status === 'waitingConfirmation' &&
        order.paidType === 'manual' &&
        order.paidAt && (
          <>
            <hr />
            <div className="flex justify-center items-center gap-2 ">
              <button
                onClick={() => handleCheck('deny')}
                className="flex justify-center w-full p-2 items-center gap-2 rounded-full bg-red-500 text-white font-semibold"
              >
                Deny
              </button>
              <button
                onClick={() => handleCheck('confirm')}
                className="flex justify-center w-full p-2 items-center gap-2 rounded-full bg-blue-500 text-white font-semibold"
              >
                Approve
              </button>
            </div>
          </>
        )}
    </>
  );
};

export default PaymentOrder;
