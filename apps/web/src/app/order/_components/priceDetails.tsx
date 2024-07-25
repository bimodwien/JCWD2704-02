import { formatPrice } from '@/helpers/format';
import { TOrder } from '@/models/order.model';

interface PriceDetailsProps {
  order: TOrder | undefined;
  payNow: () => void;
  seeProof: () => void;
}

const PriceDetails: React.FC<PriceDetailsProps> = ({
  order,
  payNow,
  seeProof,
}) => {
  if (!order) return null;
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
        <hr />
        {order.status === 'waitingPayment' && (
          <button
            onClick={payNow}
            className="flex justify-center bg-blue-600 text-white text-lg rounded-full p-2 font-semibold"
          >
            Pay Now
          </button>
        )}
      </div>
      {order.status === 'waitingConfirmation' && (
        <button
          onClick={seeProof}
          className="flex justify-center w-full p-2 items-center gap-2 rounded-full border-2 border-blue-500 text-blue-700 font-semibold hover:bg-blue-50"
        >
          See Payment Proof
        </button>
      )}
    </>
  );
};

export default PriceDetails;
