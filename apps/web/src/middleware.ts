import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { TUser } from './models/user';

export async function middleware(request: NextRequest) {
  const refresh_token = request.cookies.get('access_token')?.value || '';
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  console.log(refresh_token, 'refresh_token');
  const isLogin = await fetch('http://localhost:8000/admins/validate', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${refresh_token}`,
    },
  })
    .then(async (res) => {
      const data = await res.json();
      if (!data.access_token) throw new Error('Token not found');
      response.cookies.set('access_token', data.access_token);
      return true;
    })
    .catch((err) => {
      if (err instanceof Error) console.log(err.message);
      return false;
    });

  console.log(isLogin);

  const token = response.cookies.get('access_token')?.value;

  const decode = token ? (jwtDecode(token) as { user: TUser }) : undefined;
  console.log(decode, 'decode');

  const isSuperAdmin = decode?.user?.role === 'superAdmin';
  // const isStoreAdmin = decode?.role === 'storeAdmin';
  if (!isSuperAdmin && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  // if (
  //   (pathname === '/login' || pathname === '/register') &&
  //   is_verified &&
  //   is_user
  // ) {
  //   return NextResponse.redirect(new URL('/', request.url));
  // } else if (pathname === '/login' && !isLogin && !is_storeAdmin) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // } else if (pathname === '/dashboard' && !isLogin && !is_storeAdmin) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // } else if (pathname === '/login' && isLogin && is_storeAdmin) {
  //   return NextResponse.redirect(new URL('/dashboard', request.url));
  // } else if (pathname === '/login' && isLogin && is_superAdmin) {
  //   return NextResponse.redirect(new URL('/dashboard', request.url));
  // }
  return response;
}
export const config = {
  matcher: [
    '/login',
    '/auth',
    '/dashboard',
    '/verification',
    '/register',
    '/admin',
    '/',
  ],
};
