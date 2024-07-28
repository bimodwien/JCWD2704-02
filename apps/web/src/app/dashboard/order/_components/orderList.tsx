'use client';

import { formatPrice } from '@/helpers/format';
import { axiosInstance } from '@/lib/axios';
import { TOrder } from '@/models/order.model';
import { Table } from 'flowbite-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md';
import { LuExternalLink } from 'react-icons/lu';
import { RxAvatar } from 'react-icons/rx';
import { useDebounce } from 'use-debounce';
import Sidebar from './Sidebar';
import { DateRange, Range, RangeKeyDict } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

const OrderList = () => {
  const [search, setSearch] = useState<string>('');
  const [invoice, setInvoice] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(8);
  const [sortBy, setSortBy] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPaid, setFilterPaid] = useState<string>('');
  const [value] = useDebounce(search, 1000);
  const [valueInv] = useDebounce(invoice, 1000);
  const [orderData, setOrderData] = useState<TOrder[]>([]);
  const [dateRange, setDateRange] = useState<Range[]>([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
  const [showDateRange, setShowDateRange] = useState<boolean>(false);
  const [byDate, setByDate] = useState<string>('no');
  const [tempDateRange, setTempDateRange] = useState<Range[]>(dateRange);
  dayjs.extend(relativeTime);

  const handleDateOpen = () => {
    if (showDateRange) {
      setShowDateRange(false);
    } else {
      setShowDateRange(true);
    }
  };

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

  const fetchOrder = async () => {
    try {
      const startDate = dateRange[0]?.startDate?.toISOString();
      const endDate = dateRange[0]?.endDate?.toISOString();
      const queryParams: Record<string, any> = {
        store: value,
        invoice: valueInv,
        byDate,
        ...(filterStatus && { status: filterStatus }),
        ...(filterPaid && { paid: filterPaid }),
        ...(sortBy && { sort: sortBy }),
        ...(byDate === 'yes' && startDate && { startDate: startDate }),
        ...(byDate === 'yes' && endDate && { endDate: endDate }),
        page,
        limit,
      };

      console.log('Query Params:', queryParams); // Debugging

      const response = await axiosInstance().get('/order/all', {
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

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(parseInt(e.target.value));
    setPage(1);
  };

  useEffect(() => {
    fetchOrder();
  }, [
    value,
    valueInv,
    byDate,
    sortBy,
    filterStatus,
    filterPaid,
    dateRange,
    page,
    limit,
  ]);

  useEffect(() => {
    setPage(1);
  }, [value, valueInv, sortBy, filterStatus, filterPaid, dateRange]);

  return (
    <section className="bg-[#F4F7FE] flex w-full h-full">
      <Sidebar />
      <div className="w-full p-5">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
          <div>
            <div className="font-dm-sans text-base font-medium leading-6 text-left text-[#707EAE]">
              Dashboard/Orders
            </div>
            <div className="font-dm-sans text-display-small font-bold text-left">
              Orders
            </div>
          </div>
          <div className="flex items-center gap-10 bg-white px-10 py-2 rounded-full border border-gray-200">
            <div className="flex gap-5 py-1">
              <input
                type="text"
                placeholder="Search invoice..."
                className="bg-[#F4F7FE] rounded-full pl-5 py-1 font-dm-sans text-14px"
                value={invoice}
                onChange={(e) => setInvoice(e.target.value)}
              />
            </div>
            <div>
              <RxAvatar className="h-7 w-7" />
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-5 mt-5 ">
          <div className="flex gap-5 items-center">
            <div className="flex items-center">
              <select
                id="status"
                className="bg-white border border-gray-200 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block p-2.5 w-full"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">all status</option>
                <option value="waitingPayment">unpaid</option>
                <option value="waitingConfirmation">unchecked</option>
                <option value="processed">processed</option>
                <option value="shipped">shipped</option>
                <option value="confirmed">confirmed</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>
            <div className="flex items-center">
              <select
                id="paid"
                className="bg-white border border-gray-200 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block p-2.5 w-full"
                value={filterPaid}
                onChange={(e) => setFilterPaid(e.target.value)}
              >
                <option value="">all payment</option>
                <option value="manual">manual</option>
                <option value="gateway">gateway</option>
              </select>
            </div>
            <div className="flex items-center">
              <select
                id="sort"
                className="bg-white border border-gray-200 text-gray-900 sm:text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block p-2.5 w-full"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="">sort by</option>
                <option value="desc">newest</option>
                <option value="asc">latest</option>
              </select>
            </div>
            <div className="relative z-50">
              <div className="flex justify-center sm:text-sm border rounded-xl border-gray-200 p-0.5 bg-white items-center w-80">
                <button
                  onClick={handleDateOpen}
                  className="px-3 rounded-xl w-full h-full py-2"
                >
                  <span>
                    {dateRange[0]?.startDate && dateRange[0]?.endDate ? (
                      <div className="flex items-center justify-center gap-2">
                        <div>
                          {dayjs(dateRange[0].startDate).format('DD MMM YYYY')}
                        </div>
                        <div>-</div>
                        <div>
                          {dayjs(dateRange[0].endDate).format('DD MMM YYYY')}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <div>Start Date</div>
                        <div>-</div>
                        <div>End Date</div>
                      </div>
                    )}
                  </span>
                </button>
                <button
                  onClick={handleResetDateRange}
                  className="bg-blue-500 text-white py-1 px-3 rounded-xl m-1"
                >
                  reset
                </button>
              </div>
              {showDateRange && (
                <div className="absolute top-0 bg-white p-4 shadow-lg rounded-xl overflow-hidden">
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
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <Table>
              <Table.Head className="text-center">
                <Table.HeadCell className="bg-gray-100">
                  <div className="w-28">invoice</div>
                </Table.HeadCell>
                <Table.HeadCell className="bg-gray-100">
                  <div className="w-28">store</div>
                </Table.HeadCell>
                <Table.HeadCell className="bg-gray-100">
                  <div className="w-44">user</div>
                </Table.HeadCell>
                <Table.HeadCell className="bg-gray-100">
                  <div className="w-28">total</div>
                </Table.HeadCell>
                <Table.HeadCell className="bg-gray-100">
                  <div className="w-16">payment</div>
                </Table.HeadCell>
                <Table.HeadCell className="bg-gray-100">
                  <div className="w-24">status</div>
                </Table.HeadCell>
                <Table.HeadCell className="bg-gray-100">
                  <div className="w-10">detail</div>
                </Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {orderData && orderData.length > 0 ? (
                  orderData.map((order, index) => {
                    return (
                      <Table.Row
                        key={order.id}
                        className="bg-white text-center"
                      >
                        <Table.Cell>
                          <div className="w-28">{order.invoice}</div>
                        </Table.Cell>
                        <Table.Cell>
                          <div
                            className="w-28"
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {order.store.name}
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex flex-col w-44 overflow-hidden">
                            <div className="font-semibold">
                              {order.user.name}
                            </div>
                            <div>{order.user.email}</div>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="w-28">
                            {formatPrice(order.totalPrice)}
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="w-16">{order.paidType}</div>
                        </Table.Cell>
                        <Table.Cell>
                          <div
                            className={`border-2 w-24 text-sm font-medium px-2 py-1 h-full rounded-full ${order.status === 'cancelled' ? 'border-red-400 text-red-500 bg-red-100' : order.status === 'confirmed' ? 'border-green-400 text-green-500 bg-green-100' : order.status === 'waitingPayment' ? 'border-amber-400 text-amber-500 bg-amber-100' : 'border-blue-400 text-blue-500 bg-blue-100'}`}
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
                        </Table.Cell>
                        <Table.Cell>
                          <Link
                            href={`/dashboard/order/${order.id}`}
                            className="flex justify-center"
                          >
                            <LuExternalLink className="text-xl text-center" />
                          </Link>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })
                ) : (
                  <Table.Row className="bg-white">
                    <Table.Cell colSpan={7} className="text-center">
                      No orders found.
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>
          <div className="flex justify-center gap-3 items-center text-sm">
            <button
              className={`p-2 text-center rounded-full bg-[#4318FF] text-white font-semibold ${
                page === 1 ? 'opacity-50' : ''
              }`}
              onClick={handlePrevPage}
              disabled={page === 1}
            >
              <MdNavigateBefore />
            </button>
            <span className=" font-semibold w-14 text-center py-2 px-3 rounded-xl border-gray-300 border">
              {page}
            </span>
            <button
              className={`p-2 text-center rounded-full bg-[#4318FF] text-white font-semibold ${
                orderData.length < limit ? 'opacity-50' : ''
              }`}
              onClick={handleNextPage}
              disabled={orderData.length < limit}
            >
              <MdNavigateNext />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderList;
