'use client';
import React from 'react';

import { RxAvatar } from 'react-icons/rx';
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md';
import Sidebar from '@/components/Sidebar';

type Props = {};

const Dashboard = (props: Props) => {
  return (
    <>
      <section className="bg-[#F4F7FE] flex w-full top-[49px] left-[290px] min-h-lvh">
        {/* sidebar, nanti dijadiin component sidebar */}
        <Sidebar />
        {/* content, nanti dipisah jadi component content dashboardnya */}
        <div className="py-6 px-10 w-full">
          <p>Ini halaman Dashboard</p>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
