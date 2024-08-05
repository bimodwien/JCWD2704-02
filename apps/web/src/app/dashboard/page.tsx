'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { TSales, TSalesCategory, TSalesProduct } from '@/models/sales';
import {
  fetchSales,
  fetchSalesByCategory,
  fetchSalesByProduct,
} from '@/helpers/fetchSales';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type Props = {};

const Dashboard = (props: Props) => {
  const [sales, setSales] = useState<TSales[]>([]);
  const [salesByCategory, setSalesCategory] = useState<TSalesCategory[]>([]);
  const [salesByProduct, setSalesProduct] = useState<TSalesProduct[]>([]);
  const [reportType, setReportType] = useState<string>('overall');

  useEffect(() => {
    fetchSales(setSales);
    fetchSalesByCategory(setSalesCategory);
    fetchSalesByProduct(setSalesProduct);
  }, []);

  const renderChart = () => {
    switch (reportType) {
      case 'category':
        return (
          <>
            <div className="mt-10">
              <h1 className="mb-4 text-xl font-bold text-gray-900">
                Report Sales By Category
              </h1>
              <div className="py-10 flex flex-col gap-10">
                <div className="px-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8">
                  <h5 className="mb-5 text-xl font-bold text-gray-900">
                    Total Revenue by Category
                  </h5>
                  <ResponsiveContainer width={'100%'} height={300}>
                    <LineChart data={salesByCategory} className="bg-white pl-2">
                      <Line
                        type="monotone"
                        dataKey="totalRevenue"
                        stroke="#8884d8"
                      />
                      <CartesianGrid stroke="#ccc" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name, props) => [
                          `${value}`,
                          `Category: ${props.payload.category}`,
                        ]}
                      />
                      <Legend />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="px-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8">
                  <h5 className="mb-5 text-xl font-bold text-gray-900">
                    Total Sales by Category
                  </h5>
                  <ResponsiveContainer width={'100%'} height={300}>
                    <LineChart
                      data={salesByCategory}
                      className="bg-white pl-2 rounded-lg"
                    >
                      <Line
                        type="monotone"
                        dataKey="totalSales"
                        stroke="#82ca9d"
                      />
                      <CartesianGrid stroke="#ccc" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name, props) => [
                          `${value}`,
                          `Category: ${props.payload.category}`,
                        ]}
                      />
                      <Legend />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        );
      case 'product':
        return (
          <>
            <div className="mt-10">
              <h1 className="mb-4 text-xl font-bold text-gray-900">
                Report Sales By Product
              </h1>
              <div className="py-10 flex flex-col gap-10">
                <div className="px-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8">
                  <h5 className="mb-5 text-xl font-bold text-gray-900">
                    Total Revenue by Product
                  </h5>
                  <ResponsiveContainer width={'100%'} height={300}>
                    <LineChart data={salesByProduct} className="bg-white pl-2">
                      <Line
                        type="monotone"
                        dataKey="totalRevenue"
                        stroke="#8884d8"
                      />
                      <CartesianGrid stroke="#ccc" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name, props) => [
                          `${value}`,
                          `Product: ${props.payload.product}`,
                        ]}
                      />
                      <Legend />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="px-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8">
                  <h5 className="mb-5 text-xl font-bold text-gray-900">
                    Total Sales by Product
                  </h5>
                  <ResponsiveContainer width={'100%'} height={300}>
                    <LineChart
                      data={salesByProduct}
                      className="bg-white pl-2 rounded-lg"
                    >
                      <Line
                        type="monotone"
                        dataKey="totalSales"
                        stroke="#82ca9d"
                      />
                      <CartesianGrid stroke="#ccc" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name, props) => [
                          `${value}`,
                          `Product: ${props.payload.product}`,
                        ]}
                      />
                      <Legend />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        );
      default:
        return (
          <>
            <div className="mt-10">
              <h1 className="mb-4 text-xl font-bold text-gray-900">
                Report Sales Per Month
              </h1>
              <div className="py-10 flex flex-col gap-10 w-full">
                <div className="px-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8">
                  <h5 className="mb-5 text-xl font-bold text-gray-900">
                    Total Revenue
                  </h5>
                  <ResponsiveContainer width={'100%'} height={300}>
                    <LineChart data={sales} className="bg-white pl-2">
                      <Line
                        type="monotone"
                        dataKey="totalRevenue"
                        stroke="#8884d8"
                      />
                      <CartesianGrid stroke="#ccc" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="px-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8">
                  <h5 className="mb-5 text-xl font-bold text-gray-900">
                    Total Sales
                  </h5>
                  <ResponsiveContainer width={'100%'} height={300}>
                    <LineChart
                      data={sales}
                      className="bg-white pl-2 rounded-lg"
                    >
                      <Line
                        type="monotone"
                        dataKey="totalSales"
                        stroke="#82ca9d"
                      />
                      <CartesianGrid stroke="#ccc" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <>
      <section className="bg-[#F4F7FE] flex w-full top-[49px] left-[290px] min-h-lvh">
        <Sidebar />
        <div className="py-6 px-10 w-full flex flex-col min-h-screen">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-dm-sans text-base font-medium leading-6 text-left text-[#707EAE]">
                Dashboard/
              </div>
              <div className="font-dm-sans text-display-small font-bold text-left">
                Dashboard
              </div>
            </div>
            <div className="flex items-center gap-10 bg-white px-10 py-2 rounded-full">
              <div className="flex gap-5 py-1">
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="bg-[#F4F7FE] rounded-full pl-5 py-1 font-dm-sans text-14px"
                >
                  <option value="overall">Overall</option>
                  <option value="category">By Category</option>
                  <option value="product">By Product</option>
                </select>
              </div>
            </div>
          </div>
          {renderChart()}
        </div>
      </section>
    </>
  );
};

export default Dashboard;
