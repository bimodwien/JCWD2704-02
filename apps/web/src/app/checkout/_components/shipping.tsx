import React from 'react';
import { TAddress, TCart } from '@/models/cart.model';
import { MdOutlineStorefront } from 'react-icons/md';
import { IoHomeOutline } from 'react-icons/io5';

interface ShippingDetailsProps {
  cartData: TCart[];
  shippingAddress: TAddress | null;
}

const ShippingDetails: React.FC<ShippingDetailsProps> = ({
  cartData,
  shippingAddress,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-xl font-semibold">Shipping Method</div>
      <div className="flex flex-col lg:flex-row lg:justify-start w-full gap-2">
        <div className="rounded-xl border border-gray-400 p-3 lg:w-96">
          <div className="font-medium flex gap-1 items-center">
            <MdOutlineStorefront className="text-base text-center" />
            <div>Store Address</div>
          </div>
          {cartData.length > 0 && (
            <div className="text-sm flex flex-col">
              <span className="font-medium">({cartData[0].store?.name})</span>
              <div
                className="flex flex-col overflow-hidden"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {cartData[0].store?.address}
              </div>
            </div>
          )}
        </div>
        <div className="rounded-xl border border-gray-400 p-3 lg:w-96">
          <div className="font-medium flex gap-1 items-center">
            <IoHomeOutline className="text-base text-center" />
            <div>Customer Address</div>
          </div>
          {shippingAddress && (
            <div className="text-sm flex flex-col">
              {shippingAddress.name && (
                <span className="font-medium">({shippingAddress.name})</span>
              )}
              <div
                className="flex flex-col overflow-hidden"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {shippingAddress.address}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShippingDetails;
