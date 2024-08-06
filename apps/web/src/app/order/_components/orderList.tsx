'use client';
import { formatPrice, productSrc } from '@/helpers/format';
import { axiosInstance } from '@/lib/axios';
import { TOrder } from '@/models/order.model';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { DateRange, Range, RangeKeyDict } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Image from 'next/image';
import { BiSearch } from 'react-icons/bi';
import { FaRegCalendar } from 'react-icons/fa6';
import { IoIosArrowDown, IoIosCloseCircleOutline } from 'react-icons/io';
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md';

const OrderList = () => {
  const [invoice, setInvoice] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(8);
  const [sortBy, setSortBy] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [valueInv] = useDebounce(invoice, 1500);
  const [orderData, setOrderData] = useState<TOrder[]>([]);
  const [dateRange, setDateRange] = useState<Range[]>([
    {
      startDate: undefined,
      endDate: undefined,
      key: 'selection',
    },
  ]);
  const [showDateRange, setShowDateRange] = useState<boolean>(false);
  const [byDate, setByDate] = useState<string>('no');
  const [tempDateRange, setTempDateRange] = useState<Range[]>([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
  dayjs.extend(relativeTime);

  const handleDateOpen = () => {
    if (showDateRange) {
      setShowDateRange(false);
      setTempDateRange([
        {
          startDate: new Date(),
          endDate: new Date(),
          key: 'selection',
        },
      ]);
    } else {
      setShowDateRange(true);
    }
  };

  const dateRangeRef = useRef<HTMLDivElement>(null);

  const handleDateRangeChange = (rangesByKey: RangeKeyDict) => {
    const { selection } = rangesByKey;
    if (selection) {
      setTempDateRange([selection]);
    }
  };

  const handleResetDateRange = () => {
    setDateRange([
      {
        startDate: undefined,
        endDate: undefined,
        key: 'selection',
      },
    ]);
    setByDate('no');
    setShowDateRange(false);
  };

  const handleApplyDateRange = () => {
    setDateRange(tempDateRange);
    setByDate('yes');
    setShowDateRange(false);
  };

  const handleStatus = (status: string) => {
    setFilterStatus(status);
  };

  const fetchOrder = async () => {
    try {
      const startDate = dateRange[0]?.startDate?.toISOString();
      const endDate = dateRange[0]?.endDate?.toISOString();
      const queryParams: Record<string, any> = {
        invoice: valueInv,
        byDate,
        ...(filterStatus && { status: filterStatus }),
        ...(sortBy && { sort: sortBy }),
        ...(byDate === 'yes' && startDate && { startDate: startDate }),
        ...(byDate === 'yes' && endDate && { endDate: endDate }),
        page,
        limit,
      };

      console.log('Query Params:', queryParams); // Debugging

      const response = await axiosInstance().get('/order/yours', {
        params: queryParams,
      });
      const { data } = response.data;
      console.log('data: ', data);
      setOrderData(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrderData([]);
    }
  };

  const handleNextPage = () => {
    setPage(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  useEffect(() => {
    fetchOrder();
  }, [valueInv, byDate, sortBy, filterStatus, dateRange, page, limit]);

  useEffect(() => {
    setPage(1);
  }, [valueInv, sortBy, filterStatus, dateRange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dateRangeRef.current &&
        !dateRangeRef.current.contains(event.target as Node)
      ) {
        setShowDateRange(false);
      }
    };

    if (showDateRange) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDateRange]);

  const isActive = (status: string) => filterStatus === status;

  return (
    <div className="p-5 md:p-10 flex gap-10 bg-gray-100 justify-center w-full">
      <div className="flex flex-col gap-5 w-full lg:px-10 max-w-[1000px]">
        <div className="font-semibold text-2xl lg:text-3xl">Order History</div>
        <div className="flex flex-col gap-3 w-full bg-white rounded-xl px-5 pt-3 shadow-sm border border-gray-200">
          <div className="flex gap-5 items-center w-full lg:justify-between lg:flex-row flex-col">
            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-sm w-full lg:w-96 border border-gray-300">
              <BiSearch />
              <input
                type="text"
                placeholder="Search invoice..."
                className="  placeholder-gray-500 outline-none"
                value={invoice}
                onChange={(e) => setInvoice(e.target.value)}
              />
            </div>
            <div className="flex gap-5 justify-between lg:justify-end items-center w-full">
              <div className="flex items-center">
                <select
                  id="sort"
                  className="bg-white border border-gray-300 text-gray-500 text-sm lg:text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 min-h-10 px-2 block w-full h-full lg:w-28"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="">Sort by</option>
                  <option value="desc">Newest</option>
                  <option value="asc">Latest</option>
                </select>
              </div>
              <div className="relative z-10" ref={dateRangeRef}>
                <div className="flex justify-center gap-1 text-sm lg:text-sm text-gray-500 border rounded-xl border-gray-300 bg-white items-center w-full h-full lg:w-64 min-h-10">
                  <button
                    onClick={handleDateOpen}
                    className="w-full h-full ml-3"
                  >
                    <span>
                      {dateRange[0]?.startDate && dateRange[0]?.endDate ? (
                        <div className="flex items-center justify-start gap-2">
                          <FaRegCalendar />
                          <div>
                            {dayjs(dateRange[0].startDate).format(
                              'DD MMM YYYY',
                            )}
                          </div>
                          <div>-</div>
                          <div>
                            {dayjs(dateRange[0].endDate).format('DD MMM YYYY')}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-start gap-2">
                          <FaRegCalendar />
                          Select the order date
                        </div>
                      )}
                    </span>
                  </button>
                  {dateRange[0]?.startDate && dateRange[0]?.endDate ? (
                    <button onClick={handleResetDateRange} className="mr-3">
                      <IoIosCloseCircleOutline className="w-4 h-4" />
                    </button>
                  ) : (
                    <button onClick={handleDateOpen} className="mr-3">
                      <IoIosArrowDown className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {showDateRange && (
                  <div className="absolute top-0 right-0 bg-white p-4 shadow-lg rounded-xl overflow-hidden border border-gray-300">
                    <DateRange
                      ranges={tempDateRange}
                      onChange={handleDateRangeChange}
                    />
                    <div className="flex justify-center items-center gap-2 mt-4">
                      <button
                        onClick={handleDateOpen}
                        className="bg-amber-500 text-white py-1 px-3 rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleApplyDateRange}
                        className="bg-green-500 text-white py-1 px-3 rounded-xl"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-between overflow-auto gap-5 bg-white border-t border-gray-300">
            <button
              className={`w-20 py-2 border-b-2 ${isActive('') ? 'text-blue-500 border-blue-500' : 'text-gray-500 border-transparent'} hover:text-blue-500`}
              onClick={() => handleStatus('')}
            >
              All
            </button>
            <button
              className={`w-20 py-2 border-b-2 ${isActive('waitingPayment') ? 'text-blue-500 border-blue-500' : 'text-gray-500 border-transparent'} hover:text-blue-500`}
              onClick={() => handleStatus('waitingPayment')}
            >
              Unpaid
            </button>
            <button
              className={`w-20 py-2 border-b-2 ${isActive('waitingConfirmation') ? 'text-blue-500 border-blue-500' : 'text-gray-500 border-transparent'} hover:text-blue-500`}
              onClick={() => handleStatus('waitingConfirmation')}
            >
              Unchecked
            </button>
            <button
              className={`w-20 py-2 border-b-2 ${isActive('processed') ? 'text-blue-500 border-blue-500' : 'text-gray-500 border-transparent'} hover:text-blue-500`}
              onClick={() => handleStatus('processed')}
            >
              Processed
            </button>
            <button
              className={`w-20 py-2 border-b-2 ${isActive('shipped') ? 'text-blue-500 border-blue-500' : 'text-gray-500 border-transparent'} hover:text-blue-500`}
              onClick={() => handleStatus('shipped')}
            >
              Shipped
            </button>
            <button
              className={`w-20 py-2 border-b-2 ${isActive('confirmed') ? 'text-blue-500 border-blue-500' : 'text-gray-500 border-transparent'} hover:text-blue-500`}
              onClick={() => handleStatus('confirmed')}
            >
              Confirmed
            </button>
            <button
              className={`w-20 py-2 border-b-2 ${isActive('cancelled') ? 'text-blue-500 border-blue-500' : 'text-gray-500 border-transparent'} hover:text-blue-500`}
              onClick={() => handleStatus('cancelled')}
            >
              Cancelled
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full ">
          {orderData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 border border-gray-200 bg-white rounded-xl p-5 shadow-sm">
              <Image
                src="/notif-order.svg"
                alt="No Data"
                width={200}
                height={200}
              />
              <div className="text-gray-500 mt-4">No orders found</div>
            </div>
          ) : (
            orderData.map((order) => (
              <Link
                href={`/order/${order.invoice}`}
                key={order.id}
                className="rounded-xl p-5 bg-white w-full overflow-hidden shadow-sm border border-gray-200 flex flex-col gap-2"
              >
                <div className="font-semibold w-full border-b border-gray-300 pb-2 flex justify-between">
                  <div>Order #{order.invoice}</div>
                  <div
                    className={`border-2 w-24 text-sm font-medium px-2 py-1 h-full rounded-full text-center ${order.status === 'cancelled' ? 'border-red-400 text-red-500 bg-red-100' : order.status === 'confirmed' ? 'border-green-400 text-green-500 bg-green-100' : order.status === 'waitingPayment' ? 'border-amber-400 text-amber-500 bg-amber-100' : 'border-blue-400 text-blue-500 bg-blue-100'}`}
                  >
                    {order.status === 'cancelled'
                      ? 'cancelled'
                      : order.status == 'confirmed'
                        ? 'confirmed'
                        : order.status === 'waitingPayment'
                          ? 'unpaid'
                          : order.status === 'waitingConfirmation'
                            ? 'unchecked'
                            : order.status === 'processed'
                              ? 'processed'
                              : order.status === 'shipped'
                                ? 'shipped'
                                : order.status === 'confirmed'
                                  ? 'confirmed'
                                  : ''}
                  </div>
                </div>
                <div>
                  {order.OrderItem && order.OrderItem.length > 0 ? (
                    <div className="flex flex-col gap-2 text-sm lg:text-base">
                      <div className="flex justify-between">
                        <div className="flex gap-3 items-center">
                          <img
                            src={`${productSrc}${order.OrderItem[0].product.ProductImage[0].id}`}
                            alt={order.OrderItem[0].product.name}
                            className="w-14 h-14 rounded object-cover"
                          />
                          <div className="flex flex-col gap-1 w-36 lg:w-96">
                            <div>{order.OrderItem[0].product.name}</div>
                            <div>{order.OrderItem[0].quantity}x</div>
                          </div>
                        </div>
                        <div className="w-28 lg:w-40 text-right">
                          {formatPrice(order.OrderItem[0].price)}
                        </div>
                      </div>
                      {order.OrderItem.length > 1 && (
                        <div className="text-center pt-1 border-t border-gray-300">
                          see more product
                        </div>
                      )}
                      <div className="flex justify-between pt-1 border-t border-gray-300">
                        <div>{order.OrderItem.length} product</div>
                        <div>Total: {formatPrice(order.totalPrice)}</div>
                      </div>
                    </div>
                  ) : (
                    <div></div>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
        {orderData && orderData.length > 0 && (
          <div className="flex justify-center gap-3 items-center text-sm">
            <button
              className={`p-2 text-center rounded-full bg-blue-600 text-white font-semibold ${
                page === 1 ? 'opacity-50' : ''
              }`}
              onClick={handlePrevPage}
              disabled={page === 1}
            >
              <MdNavigateBefore />
            </button>
            <span className=" font-semibold w-14 text-center py-2 px-3 bg-white rounded-xl border-gray-300 border">
              {page}
            </span>
            <button
              className={`p-2 text-center rounded-full bg-blue-600 text-white font-semibold ${
                orderData.length < limit ? 'opacity-50' : ''
              }`}
              onClick={handleNextPage}
              disabled={orderData.length < limit}
            >
              <MdNavigateNext />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;
