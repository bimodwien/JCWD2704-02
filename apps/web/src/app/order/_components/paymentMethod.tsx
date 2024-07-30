import Image from 'next/image';
import { TOrder } from '@/models/order.model';
import { useState } from 'react';

interface PaymentMethodProps {
  order: TOrder | null;
}

const PaymentMethod: React.FC<PaymentMethodProps> = ({ order }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = '10923874651928';
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      })
      .catch((err) => console.error('Failed to copy:', err));
  };

  if (!order) {
    return null;
  }

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
        {order.status === 'waitingConfirmation' && (
          <div className="rounded-xl border border-blue-500 bg-blue-50 p-3 flex flex-col gap-1 text-sm">
            Waiting payment confirmation from admin
          </div>
        )}
        {order.paidType === 'manual' && order.status === 'waitingPayment' && (
          <div className="rounded-xl border border-blue-500 bg-blue-50 p-3 flex flex-col gap-1">
            <div className="flex flex-col items-center font-semibold justify-center">
              BANK ACCOUNT
              <span className="font-semibold text-red-700 flex justify-center gap-2">
                10923874651928
                <button
                  className="p-1 w-16 bg-blue-500 text-white text-center text-xs rounded-full hover:bg-blue-600"
                  onClick={handleCopy}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </span>
            </div>
            <div className="flex justify-center gap-2 items-center">
              Merchant Name: <span className="font-semibold">BBH Store</span>
            </div>
          </div>
        )}
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
    </>
  );
};

export default PaymentMethod;
