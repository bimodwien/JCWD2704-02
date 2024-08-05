import React from 'react';
import Image from 'next/image';
import { formatPrice } from '@/helpers/format';
import { BiSolidDiscount } from 'react-icons/bi';
import { MdOutlinePayment } from 'react-icons/md';
import { TUserVoucher } from '@/models/cart.model';

interface PaymentMethodProps {
  paymentType: 'manual' | 'gateway' | undefined;
  handlePaymentTypeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  totalPrice: number;
  handleOrderNow: () => void;
  seeVoucher: () => void;
  selectedVoucher: TUserVoucher | null;
}

const PaymentMethod: React.FC<PaymentMethodProps> = ({
  paymentType,
  handlePaymentTypeChange,
  totalPrice,
  handleOrderNow,
  seeVoucher,
  selectedVoucher,
}) => {
  const defaultShippingCost = 20000;

  const getDiscountInfo = () => {
    if (
      selectedVoucher &&
      selectedVoucher.voucher &&
      selectedVoucher.voucher.category === 'totalPurchase'
    ) {
      const { value, type, maxDiscount } = selectedVoucher.voucher;
      let discount = 0;

      if (type === 'nominal') {
        discount = Math.min(value, totalPrice);
      } else if (type === 'percentage') {
        discount = (totalPrice * value) / 100;
        discount = Math.min(discount, maxDiscount);
      }

      return discount;
    } else if (selectedVoucher && selectedVoucher.category === 'product') {
      let discount = 0;

      if (selectedVoucher.type === 'nominal') {
        discount = Math.min(selectedVoucher.value, totalPrice);
      } else if (selectedVoucher.type === 'percentage') {
        discount = (totalPrice * selectedVoucher.value) / 100;
        discount = Math.min(discount, selectedVoucher.maxDiscount);
      }

      return discount;
    }
    return 0;
  };

  const discountAmount = Math.round(getDiscountInfo());
  const shippingCost =
    selectedVoucher &&
    selectedVoucher.voucher &&
    selectedVoucher.voucher.category === 'shippingCost'
      ? 0
      : defaultShippingCost;

  const totalPriceWithDiscount = Math.round(totalPrice - discountAmount);
  const finalTotalPrice = Math.round(totalPriceWithDiscount + shippingCost);

  return (
    <>
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
                    <div className="text-sm flex gap-2 flex-wrap">
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
                      <div className="rounded-full bg-gray-200 w-4 h-4 flex justify-center items-center text-center text-xs">
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
              <span className="font-normal">Subtotal</span>
              {formatPrice(totalPrice)}
            </div>
            <div className="flex justify-between items-center font-semibold ">
              <span className="font-normal">Shipping</span>
              {formatPrice(shippingCost)}
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between items-center font-semibold ">
                <span className="font-normal">Voucher</span>-
                {formatPrice(discountAmount)}
              </div>
            )}
            <hr />
            <div className="flex justify-between items-center font-semibold text-lg">
              <span className="">Total Payment</span>
              {formatPrice(finalTotalPrice)}
            </div>
            <hr />
            <button
              onClick={seeVoucher}
              className="flex justify-center w-full p-2 items-center gap-2 rounded-full border-2 border-blue-500 text-blue-700 hover:bg-blue-100 font-semibold"
            >
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
    </>
  );
};

export default PaymentMethod;
