import { axiosInstance } from '@/lib/axios';
import { TOrder } from '@/models/order.model';
import { CiCircleInfo } from 'react-icons/ci';
import Swal from 'sweetalert2';

interface AdminAction {
  order: TOrder | null;
  onConfirm: () => void;
}

const AdminAction: React.FC<AdminAction> = ({ order, onConfirm }) => {
  if (!order) return null;

  const cancelOrder = async () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to cancel this order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axiosInstance().patch(
            `/orders/ca/${order.id}`,
          );
          Swal.fire({
            title: 'Success!',
            text: 'Order has been cancelled successfully.',
            icon: 'success',
            confirmButtonText: 'OK',
          });
          onConfirm();
        } catch (error) {
          Swal.fire({
            title: 'Error!',
            text: 'Failed to cancel the order. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
          console.error('Failed to cancel order:', error);
        }
      }
    });
  };

  const sendOrder = async () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to send this order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axiosInstance().patch(`/orders/s/${order.id}`);
          Swal.fire({
            title: 'Success!',
            text: 'Order has been send successfully.',
            icon: 'success',
            confirmButtonText: 'OK',
          });
          onConfirm();
        } catch (error) {
          Swal.fire({
            title: 'Error!',
            text: 'Failed to send the order. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
          console.error('Failed to cancel order:', error);
        }
      }
    });
  };

  return (
    <div>
      <div className="flex flex-col gap-3">
        {order.status === 'cancelled' ||
        order.status === 'shipped' ||
        order.status === 'confirmed' ? (
          <div className="flex gap-3 items-center w-full py-2 px-3 bg-blue-200 rounded-xl">
            <CiCircleInfo className="w-10 h-10" />
            No action is required as this order has been{' '}
            {order.status === 'cancelled'
              ? 'cancelled'
              : order.status === 'shipped'
                ? 'shipped'
                : order.status === 'confirmed'
                  ? 'confirmde'
                  : ''}
          </div>
        ) : (
          ''
        )}

        {order.status === 'processed' && (
          <button
            onClick={sendOrder}
            className="flex justify-center bg-blue-600 text-white text-lg rounded-full p-2 font-semibold w-full"
          >
            Shipped order
          </button>
        )}
        {order.status !== 'shipped' &&
          order.status !== 'confirmed' &&
          order.status !== 'cancelled' && (
            <button
              onClick={cancelOrder}
              className="flex justify-center bg-red-600 text-white text-lg rounded-full p-2 font-semibold w-full"
            >
              Cancel Order
            </button>
          )}
      </div>
    </div>
  );
};

export default AdminAction;
