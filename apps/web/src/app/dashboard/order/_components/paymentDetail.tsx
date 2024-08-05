import React from 'react';
import Swal from 'sweetalert2';
import { formatPrice } from '@/helpers/format';
import { axiosInstance } from '@/lib/axios';
import { TOrder } from '@/models/order.model';

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
      <div className="flex flex-col gap-2">
        <div className="text-lg lg:text-xl font-semibold">Price Details</div>
        <div className="flex justify-between items-center font-semibold ">
          <span className="font-normal ">Subtotal</span>
          {/* {formatPrice()} */}
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
