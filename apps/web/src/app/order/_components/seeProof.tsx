import { paymentSrc } from '@/helpers/format';
import React, { useEffect } from 'react';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

interface UploadModalProps {
  isOpen: boolean;
  order: any;
  onClose: () => void;
}

const SeeProof: React.FC<UploadModalProps> = ({ isOpen, onClose, order }) => {
  dayjs.extend(relativeTime);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.bg-white')) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-3 rounded-lg shadow-lg w-[350px] h-[550px] relative">
        <div className="flex flex-col h-full justify-center gap-3 items-center">
          <div className="text-lg font-semibold text-center">Payment Proof</div>
          <img
            src={`${paymentSrc}${order.id}`}
            alt={`payment proof ${order.invoice}`}
            className="w-60 h-[400px] rounded-xl object-cover border border-gray-200"
          />
          <div className="text-sm">
            Paid at: {dayjs(order.paidAt).format('DD MMMM YYYY, HH:mm:ss')}
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-2xl text-gray-400"
          >
            <IoIosCloseCircleOutline />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeeProof;
