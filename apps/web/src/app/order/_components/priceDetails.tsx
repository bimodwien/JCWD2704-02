import { formatPrice } from '@/helpers/format';
import { axiosInstance } from '@/lib/axios';
import { TOrder } from '@/models/order.model';
import Swal from 'sweetalert2';

interface PriceDetailsProps {
  order: TOrder | null;
  payNow: () => void;
  seeProof: () => void;
  onConfirm: () => void;
  countdown: number | null;
}

const PriceDetails: React.FC<PriceDetailsProps> = ({
  order,
  payNow,
  seeProof,
  onConfirm,
  countdown,
}) => {
  if (!order) return null;

  const cancelOrder = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to cancel this order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance().patch(`/order/cu/${order.id}`);
        Swal.fire('Cancelled!', 'Your order has been cancelled.', 'success');
        onConfirm();
      } catch (error) {
        Swal.fire(
          'Error!',
          'There was an error cancelling your order.',
          'error',
        );
      }
    }
  };

  const confirmOrder = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to confirm this order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance().patch(`/order/co/${order.id}`);
        Swal.fire('Confirmed!', 'Your order has been confirmed.', 'success');
        onConfirm();
      } catch (error) {
        Swal.fire(
          'Error!',
          'There was an error confirmed your order.',
          'error',
        );
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
        <hr />
        {order.paidType === 'manual' && order.status !== 'waitingPayment' && (
          <button
            onClick={seeProof}
            className="flex justify-center w-full p-2 items-center gap-2 rounded-full border-2 border-blue-500 text-blue-700 font-semibold hover:bg-blue-50"
          >
            See Payment Proof
          </button>
        )}

        {order.status === 'waitingPayment' && countdown !== 0 && (
          <button
            onClick={payNow}
            className="flex justify-center bg-blue-600 text-white text-lg rounded-full p-2 font-semibold"
          >
            Pay Now
          </button>
        )}
      </div>

      {order.status === 'waitingPayment' && countdown !== 0 && (
        <button
          onClick={cancelOrder}
          className="flex justify-center bg-red-600 text-white text-lg rounded-full p-2 font-semibold"
        >
          Cancel Order
        </button>
      )}
      {order.status === 'shipped' && (
        <button
          onClick={confirmOrder}
          className="flex justify-center bg-blue-600 text-white text-lg rounded-full p-2 font-semibold"
        >
          Confirm Order
        </button>
      )}
    </>
  );
};

export default PriceDetails;
