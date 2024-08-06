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
// import Sidebar from './Sidebar';
import '../../../dashboard.css';
import { DateRange, Range, RangeKeyDict } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Sidebar from '@/components/Sidebar';
import { FaRegCalendar } from 'react-icons/fa6';
import { IoIosArrowDown, IoIosCloseCircleOutline } from 'react-icons/io';
import Navbar from './navbar';
import { BiSearch } from 'react-icons/bi';

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
    <>
      <Navbar />
      <section className="bg-[#F4F7FE] flex w-full h-full ">
        <div className="hidden lg:flex">
          <Sidebar />
        </div>
        <div className="w-full p-5 mb-5">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
            <div>
              <div className="font-dm-sans text-base font-medium leading-6 text-left text-[#707EAE]">
                Dashboard/Orders
              </div>
              <div className="font-dm-sans text-display-small font-bold text-left">
                Orders
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-5 mt-5">
            <div className="flex flex-col gap-3 w-full bg-white rounded-xl px-5 pt-3 shadow-sm border border-gray-200">
              <div className="flex gap-5 items-center w-full lg:justify-between lg:flex-row flex-col">
                <div className="flex gap-5">
                  <div className="flex gap-5 py-1">
                    <input
                      type="text"
                      placeholder="Search invoice..."
                      className="bg-[#F4F7FE] rounded-full pl-5 py-1 font-dm-sans text-14px w-40"
                      value={invoice}
                      onChange={(e) => setInvoice(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-5 py-1">
                    <input
                      type="text"
                      placeholder="Search store..."
                      className="bg-[#F4F7FE] rounded-full pl-5 py-1 font-dm-sans text-14px w-40"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-5 justify-center lg:justify-end items-center w-full flex-wrap">
                  <div className="flex items-center">
                    <select
                      id="paid"
                      className="bg-white border border-gray-300 text-gray-500 text-sm lg:text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 min-h-10 px-2 block w-32 h-full "
                      value={filterPaid}
                      onChange={(e) => setFilterPaid(e.target.value)}
                    >
                      <option value="">All payment</option>
                      <option value="manual">manual</option>
                      <option value="gateway">gateway</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <select
                      id="sort"
                      className="bg-white border border-gray-300 text-gray-500 text-sm lg:text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 min-h-10 px-2 block w-32 h-full"
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
                                {dayjs(dateRange[0].endDate).format(
                                  'DD MMM YYYY',
                                )}
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
                              target="_blank"
                              rel="noopener noreferrer"
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
                className={`p-2 text-center rounded-full bg-blue-700 text-white font-semibold ${
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
                className={`p-2 text-center rounded-full bg-blue-700 text-white font-semibold ${
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
    </>
  );
};

export default OrderList;
