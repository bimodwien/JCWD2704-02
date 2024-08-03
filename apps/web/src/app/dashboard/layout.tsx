'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname: string = usePathname();

  useEffect(() => {
    const orderDetailPathRegex = /^\/dashboard\/order\/[^\/]+$/;

    if (!orderDetailPathRegex.test(pathname)) {
      import('../dashboard.css');
    }
  }, [pathname]);

  return (
    <div>
      {/* layout khusus untuk dashboard */}
      {children}
    </div>
  );
}
