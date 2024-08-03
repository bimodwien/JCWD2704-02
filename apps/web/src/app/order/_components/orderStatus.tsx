import { formatPrice, productSrc } from '@/helpers/format';
import { TOrder } from '@/models/order.model';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { IoHomeOutline, IoStorefrontOutline } from 'react-icons/io5';
import { LiaShippingFastSolid } from 'react-icons/lia';
import { MdOutlineStorefront } from 'react-icons/md';

interface StatusAndDetailProps {
  order: TOrder | null;
}

const StatusAndDetail: React.FC<StatusAndDetailProps> = ({ order }) => {
  if (!order) return null;
  dayjs.extend(relativeTime);

  return (
    <>
      <div className="flex justify-center lg:flex-col gap-4 lg:gap-2">
        <div className="flex flex-col lg:hidden items-start justify-center gap-12 text-xs">
          <div className="w-24 h-8 text-right">
            {order.createdAt && (
              <>{dayjs(order.createdAt).format('DD MMM YYYY, HH:mm:ss')}</>
            )}
          </div>
          <div className="w-24 h-8 text-right">
            {order.paidType === 'manual' && order.paidAt ? (
              <>{dayjs(order.paidAt).format('DD MMM YYYY, HH:mm:ss')}</>
            ) : order.paidType === 'gateway' && order.paidAt ? (
              <>{dayjs(order.paidAt).format('DD MMM YYYY, HH:mm:ss')}</>
            ) : (
              ''
            )}
          </div>
          <div className="w-24 h-8 text-right">
            {order.paidType === 'manual' && order.processedAt ? (
              <>{dayjs(order.processedAt).format('DD MMM YYYY, HH:mm:ss')}</>
            ) : order.paidType === 'gateway' && order.processedAt ? (
              <>{dayjs(order.processedAt).format('DD MMM YYYY, HH:mm:ss')}</>
            ) : (
              ''
            )}
          </div>
          <div className="w-24 h-8 text-right">
            {order.shippedAt && (
              <>{dayjs(order.shippedAt).format('DD MMM YYYY, HH:mm:ss')}</>
            )}
          </div>
          <div className="w-24 h-8 text-right">
            {order.confirmedAt && (
              <>{dayjs(order.confirmedAt).format('DD MMM YYYY, HH:mm:ss')}</>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center lg:flex-row">
          <div className="rounded-full w-10 h-10 border-2 border-blue-500 flex items-center justify-center text-white bg-blue-500">
            1
          </div>
          <div className="flex items-center flex-col lg:flex-row">
            <div
              className={`w-1 h-10 lg:w-24 lg:h-1 ${order.status === 'waitingPayment' || order.status === 'waitingConfirmation' || order.status === 'processed' || order.status === 'shipped' || order.status === 'confirmed' || (order.status === 'cancelled' && !order.paidAt) || (order.status === 'cancelled' && !order.processedAt) || (order.status === 'cancelled' && order.processedAt) ? 'bg-blue-500' : 'bg-gray-300'}`}
            ></div>
            <div
              className={`rounded-full w-10 h-10 border-2 flex items-center justify-center ${order.status === 'waitingPayment' || (order.status === 'cancelled' && !order.paidAt) || (order.status === 'cancelled' && !order.processedAt) ? 'border-blue-500 border-dashed' : order.status === 'waitingConfirmation' || order.status === 'processed' || order.status === 'shipped' || order.status === 'confirmed' || (order.status === 'cancelled' && order.processedAt) ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'}`}
            >
              2
            </div>
          </div>
          <div className="flex items-center flex-col lg:flex-row">
            <div
              className={`w-1 h-10 lg:w-24 lg:h-1 ${order.status === 'waitingConfirmation' || order.status === 'processed' || order.status === 'shipped' || order.status === 'confirmed' || (order.status === 'cancelled' && order.processedAt) ? 'bg-blue-500' : 'bg-gray-300'}`}
            ></div>
            <div
              className={`rounded-full w-10 h-10 border-2 flex items-center justify-center ${order.status === 'waitingConfirmation' ? 'border-blue-500 border-dashed' : order.status === 'processed' || order.status === 'shipped' || order.status === 'confirmed' || (order.status === 'cancelled' && order.processedAt && !order.shippedAt) ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'}`}
            >
              3
            </div>
          </div>
          <div className="flex items-center flex-col lg:flex-row">
            <div
              className={`w-1 h-10 lg:w-24 lg:h-1 ${order.status === 'processed' || order.status === 'shipped' || order.status === 'confirmed' || (order.status === 'cancelled' && order.processedAt) ? 'bg-blue-500' : 'bg-gray-300'}`}
            ></div>
            <div
              className={`rounded-full w-10 h-10 border-2 flex items-center justify-center ${order.status === 'processed' || (order.status === 'cancelled' && order.processedAt) ? 'border-blue-500 border-dashed' : order.status === 'shipped' || order.status === 'confirmed' ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'}`}
            >
              4
            </div>
          </div>
          <div className="flex items-center flex-col lg:flex-row">
            <div
              className={`w-1 h-10 lg:w-24 lg:h-1 ${order.status === 'shipped' || order.status === 'confirmed' ? 'bg-blue-500' : 'bg-gray-300'}`}
            ></div>
            <div
              className={`rounded-full w-10 h-10 border-2 flex items-center justify-center ${order.status === 'shipped' ? 'border-blue-500 border-dashed' : order.status === 'confirmed' ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'}`}
            >
              5
            </div>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row items-start justify-center gap-[60px] lg:gap-10 text-sm font-medium">
          <div className="w-24 lg:text-center lg:flex lg:flex-col">
            <div>Order Created</div>
            <div className="text-xs font-normal hidden lg:block">
              {order.createdAt && (
                <>{dayjs(order.createdAt).format('DD MMM YYYY, HH:mm:ss')}</>
              )}
            </div>
          </div>
          <div className="w-24 lg:text-center lg:flex lg:flex-col">
            <div>Paid</div>
            <div className="text-xs font-normal hidden lg:block">
              {order.paidType === 'manual' && order.paidAt ? (
                <>{dayjs(order.paidAt).format('DD MMM YYYY, HH:mm:ss')}</>
              ) : order.paidType === 'gateway' && order.paidAt ? (
                <>{dayjs(order.paidAt).format('DD MMM YYYY, HH:mm:ss')}</>
              ) : (
                ''
              )}
            </div>
          </div>
          <div className="w-24 lg:text-center lg:flex lg:flex-col">
            <div>Processed</div>
            <div className="text-xs font-normal hidden lg:block">
              {order.paidType === 'manual' && order.processedAt ? (
                <>{dayjs(order.processedAt).format('DD MMM YYYY, HH:mm:ss')}</>
              ) : order.paidType === 'gateway' && order.processedAt ? (
                <>{dayjs(order.processedAt).format('DD MMM YYYY, HH:mm:ss')}</>
              ) : (
                ''
              )}
            </div>
          </div>
          <div className="w-24 lg:text-center lg:flex lg:flex-col">
            <div>Shipped</div>
            <div className="text-xs font-normal hidden lg:block">
              {order.shippedAt && (
                <>{dayjs(order.shippedAt).format('DD MMM YYYY, HH:mm:ss')}</>
              )}
            </div>
          </div>
          <div className="w-24 lg:text-center lg:flex lg:flex-col">
            <div>Confirmed</div>
            <div className="text-xs font-normal hidden lg:block">
              {order.confirmedAt && (
                <>{dayjs(order.confirmedAt).format('DD MMM YYYY, HH:mm:ss')}</>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row justify-center text-sm border border-gray-300 rounded-xl overflow-hidden">
        <div className="flex flex-col gap-1 p-3 lg:w-72">
          <div className="font-medium flex gap-1 items-center">
            <div>
              <MdOutlineStorefront className="text-base text-center" />
            </div>
            <div>Store Address</div>
          </div>
          <hr />
          <div>{order.store.address}</div>
        </div>
        <div className="flex flex-col gap-1 p-3 border-y lg:border-y-0 lg:border-x border-gray-300 lg:w-72">
          <div className="font-medium flex gap-1 items-center">
            <div>
              <IoHomeOutline className="text-base text-center" />
            </div>
            <div>Customer Address</div>
          </div>
          <hr />
          <div>{order.address.address}</div>
        </div>
        <div className="flex flex-col gap-1 p-3 lg:w-72">
          <div className="font-medium flex gap-1 items-center">
            <div>
              <LiaShippingFastSolid className="text-base text-center" />
            </div>
            <div>Shipping Info</div>
          </div>
          <hr />
        </div>
      </div>
      <div className="border border-gray-300 rounded-xl overflow-hidden">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="p-2 lg:px-6 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20 lg:w-96">
                Product
              </th>
              <th className="lg:px-6 lg:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:block">
                Quantity
              </th>
              <th className="p-2 lg:px-6 lg:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y ">
            {order.OrderItem && order.OrderItem.length > 0 ? (
              order.OrderItem.map((item, index) => (
                <tr key={index} className="text-sm">
                  <td className="p-2 lg:px-6 lg:py-4 whitespace-nowrap">
                    <div className="flex gap-2 items-center w-52 lg:w-full overflow-hidden">
                      <div className="text-xs lg:hidden">{item.quantity}×</div>
                      <img
                        src={`${productSrc}${item.product.ProductImage[0].id}`}
                        alt={item.product.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div className="flex flex-col gap-1">
                        <div
                          className="text-wrap overflow-hidden "
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {item.product.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center hidden lg:flex lg:flex-col lg:h-20 lg:justify-center">
                    <div>{item.quantity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {formatPrice(item.price)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-6 py-4 text-center" colSpan={4}>
                  No items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default StatusAndDetail;
