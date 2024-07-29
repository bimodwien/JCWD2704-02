'use client';
import { usePathname } from 'next/navigation';

const useHideHeader = (): boolean => {
  const pathname = usePathname();
  const hideHeaderRoutes = ['/login', '/signUp'];

  return hideHeaderRoutes.includes(pathname);
};

export default useHideHeader;
