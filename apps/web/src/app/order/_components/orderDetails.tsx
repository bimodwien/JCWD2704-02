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
  const [order, setOrder] = useState<TOrder>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSeeProofOpen, setIsSeeProofOpen] = useState(false);
  dayjs.extend(relativeTime);
  const params = useParams();
  const { invoice } = params;

  const fetchOrderData = async () => {
    try {
      const response = await axiosInstance().get(`/order/${invoice}`);
      const { data } = response.data;
      setOrder(data);
      console.log(data);
    } catch (error) {
      console.error('Error fetching transaction data:', error);
    }
  };

  useEffect(() => {
    fetchOrderData();
  }, [invoice]);

  const handleConfirmPayment = () => {
    setIsModalOpen(false);
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
          </div>
          <StatusAndDetail order={order} />
        </div>
      </div>

      <div className="rounded-xl bg-white w-full md:w-[500px] h-full p-5 shadow-md border border-gray-200">
        <div className="flex flex-col gap-3">
          <div className="font-semibold text-xl lg:text-2xl flex gap-3 items-center">
            <MdOutlinePayment />
            Payment
          </div>
          <hr />
          <PaymentMethod order={order} />
          <hr />
          <PriceDetails order={order} payNow={payNow} seeProof={seeProof} />
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
