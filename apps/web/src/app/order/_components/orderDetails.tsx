'use client';

import { axiosInstance } from '@/lib/axios';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { TOrder } from '@/models/order.model';
import { MdOutlinePayment } from 'react-icons/md';
import StatusAndDetail from './orderStatus';
import PaymentMethod from './paymentMethod';
import PriceDetails from './priceDetails';
import SeeProof from './seeProof';
import UploadModal from './uploadProof';

const Detail = () => {
  const [order, setOrder] = useState<TOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSeeProofOpen, setIsSeeProofOpen] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  dayjs.extend(relativeTime);
  const params = useParams();
  const { invoice } = params;

  const fetchOrderData = async () => {
    try {
      const response = await axiosInstance().get(`/order/${invoice}`);
      const { data } = response.data;
      setOrder(data);
      startCountdown(data);
    } catch (error) {
      console.error('Error fetching transaction data:', error);
    }
  };

  const startCountdown = (order: TOrder) => {
    if (intervalId) {
      clearInterval(intervalId);
    }

    let deadline: dayjs.Dayjs | undefined;
    if (order.status === 'waitingPayment') {
      if (order.paidType === 'manual' && !order.paidAt) {
        deadline = dayjs(order.createdAt).add(1, 'hour');
      } else if (order.paidType === 'manual' && order.paidAt) {
        deadline = dayjs(order.checkedAt).add(1, 'hour');
      } else if (order.paidType === 'gateway' && !order.payment_method) {
        deadline = dayjs(order.createdAt).add(1, 'hour');
      } else if (
        order.paidType === 'gateway' &&
        order.payment_method &&
        !order.paidAt
      ) {
        deadline = dayjs(order.expiry_time);
      }
    }

    if (deadline) {
      const updateCountdown = () => {
        const now = dayjs();
        const timeLeft = deadline.diff(now, 'seconds');
        if (timeLeft <= 0) {
          setCountdown(0);
          clearInterval(intervalId!);
        } else {
          setCountdown(timeLeft);
        }
      };

      updateCountdown();
      const id = setInterval(updateCountdown, 1000);
      setIntervalId(id);
    } else {
      setCountdown(null);
    }
  };

  useEffect(() => {
    fetchOrderData();
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [invoice]);

  const handleConfirmPayment = () => {
    setIsModalOpen(false);
    fetchOrderData();
  };

  const handleCancel = () => {
    fetchOrderData();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsSeeProofOpen(false);
  };

  const seeProof = () => {
    setIsSeeProofOpen(true);
  };

  const payNow = () => {
    if (order?.paidType === 'gateway') {
      window.snap.pay(order?.snap_token);
    }
    if (order?.paidType === 'manual') {
      setIsModalOpen(true);
    }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute(
      'data-client-key',
      process.env.NEXT_PUBLIC_CLIENT || '',
    );
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const formatCountdown = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="p-5 md:p-10 flex flex-col md:flex-row md:justify-center gap-5 md:gap-10 bg-gray-100">
      <div className="rounded-xl p-5 bg-white w-full overflow-hidden shadow-md border border-gray-200 max-w-[900px]">
        <div className="flex flex-col gap-5">
          <div className="flex justify-between w-full border-b border-gray-300 pb-2 items-center">
            <div className="text-xl lg:text-2xl font-semibold flex flex-col lg:flex-row gap-1 lg:gap-3">
              Order Details {order && <span>#{order.invoice}</span>}
            </div>
            {order?.status === 'cancelled' && (
              <div className="border-2 border-red-500 text-red-700 bg-red-100 font-medium px-3 py-1 h-full rounded-full">
                cancelled
              </div>
            )}
            {order?.status === 'confirmed' && (
              <div className="border-2 border-green-500 text-green-700 bg-green-100 font-medium px-3 py-1 h-full rounded-full">
                confirmed
              </div>
            )}
          </div>
          <StatusAndDetail order={order} />
        </div>
      </div>

      <div className="rounded-xl bg-white w-full md:w-[450px] h-full p-5 shadow-md border border-gray-200">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-xl lg:text-2xl flex gap-3 items-center">
              <MdOutlinePayment />
              Payment
            </div>
            {order?.status === 'waitingConfirmation' ? (
              <div className="border-2 border-amber-500 text-amber-700 bg-amber-100 font-medium px-3 py-1 h-full rounded-full text-sm">
                unchecked
              </div>
            ) : order?.paidType === 'manual' &&
              order?.status === 'waitingPayment' &&
              order.paidAt ? (
              <div className="border-2 border-red-500 text-red-700 bg-red-100 font-medium px-3 py-1 h-full rounded-full text-sm">
                denied
              </div>
            ) : order?.status === 'processed' ? (
              <div className="border-2 border-blue-500 text-blue-700 bg-blue-100 font-medium px-3 py-1 h-full rounded-full text-sm">
                approve
              </div>
            ) : (
              ''
            )}
          </div>
          <hr />
          {order?.status === 'waitingPayment' && countdown !== 0 && (
            <>
              <div className="text-red-600 font-semibold text-lg">
                {countdown !== null && (
                  <>Pay before: {formatCountdown(countdown)}</>
                )}
              </div>
              <hr />
            </>
          )}
          <PaymentMethod order={order} />

          <PriceDetails
            order={order}
            payNow={payNow}
            seeProof={seeProof}
            onConfirm={handleCancel}
            countdown={countdown}
          />
        </div>
      </div>
      <SeeProof
        isOpen={isSeeProofOpen}
        onClose={handleCloseModal}
        order={order}
      />
      <UploadModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmPayment}
        order={order}
      />
    </div>
  );
};

export default Detail;
