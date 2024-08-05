'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Footer } from '@/components/Footer';
import Navbar from '@/components/navbar';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showFooter, setShowFooter] = useState(false);
  const [showNavbar, setShowNavbar] = useState(false);

  useEffect(() => {
    const pathsWithFooterAndNavbar = ['/', '/cart', '/checkout', '/order'];
    const isInvoicePage =
      pathname?.startsWith('/order/') && pathname?.split('/').length === 3;

    const detailPage =
      pathname?.startsWith('/detail/') && pathname?.split('/').length === 3;

    if (
      pathsWithFooterAndNavbar.includes(pathname) ||
      isInvoicePage ||
      detailPage
    ) {
      setShowFooter(true);
      setShowNavbar(true);
    } else {
      setShowFooter(false);
      setShowNavbar(false);
    }
  }, [pathname]);

  return (
    <>
      {showNavbar && <Navbar />}
      {children}
      {/* <Footer /> */}
    </>
  );
}
