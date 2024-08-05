import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import StoreProvider from './_provider/redux.provider';
import './_lib/firebase';
import Navbar from '@/components/navbar';
import ClientLayout from './clientLayout';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BBH Store',
  description: 'Favorite Grocery',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider>
          <ClientLayout>{children}</ClientLayout>
        </StoreProvider>
      </body>
    </html>
  );
}
