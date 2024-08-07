'use client';
import { axiosInstance } from '@/lib/axios';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { TOrder } from '@/models/order.model';
import { MdOutlineBorderColor, MdOutlinePayment } from 'react-icons/md';
import StatusAndDetail from '@/app/order/_components/orderStatus';
import PaymentOrder from './paymentDetail';
import SeeProof from '@/app/order/_components/seeProof';
import AdminAction from './actions';
import Navbar from './nav';

const DetailOrder = () => {
  const [order, setOrder] = useState<TOrder | null>(null);
  const [isSeeProofOpen, setIsSeeProofOpen] = useState(false);
  dayjs.extend(relativeTime);
  const params = useParams();
  const { orderId } = params;

  const fetchOrderData = async () => {
    try {
      const response = await axiosInstance().get(`/orders/admin/${orderId}`);
      const { data } = response.data;
      setOrder(data);
    } catch (error) {
      console.error('Error fetching transaction data:', error);
    }
  };

  useEffect(() => {
    fetchOrderData();
  }, [orderId]);

  const seeProof = () => {
    setIsSeeProofOpen(true);
  };

  const handleCloseModal = () => {
    setIsSeeProofOpen(false);
  };

  const onConfirm = () => {
    fetchOrderData();
  };

  return (
    <>
      <Navbar />
      <div className="p-5 md:p-10 flex flex-col md:flex-row md:justify-center gap-5 md:gap-10 bg-[#F4F7FE]">
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

        <div className="w-full md:w-[450px] h-full ">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 p-5 rounded-xl   shadow-md border border-gray-200 bg-white">
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
              <PaymentOrder
                order={order}
                seeProof={seeProof}
                onConfirm={onConfirm}
              />
            </div>
            <div className="flex flex-col gap-3 p-5 rounded-xl   shadow-md border border-gray-200 bg-white">
              <div className="font-semibold text-xl lg:text-2xl flex gap-3 items-center">
                <MdOutlineBorderColor />
                Action
              </div>
              <hr />
              <AdminAction order={order} onConfirm={onConfirm} />
            </div>
          </div>
        </div>
        <SeeProof
          isOpen={isSeeProofOpen}
          onClose={handleCloseModal}
          order={order}
        />
      </div>
    </>
  );
};

export default DetailOrder;
