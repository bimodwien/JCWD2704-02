import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { TUser } from './models/user';

export async function middleware(request: NextRequest) {
  const refresh_token = request.cookies.get('refresh_token')?.value || '';
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;
  const isLogin = await fetch('http://localhost:8000/v1/v3', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${refresh_token}`,
    },
  })
    .then(async (res) => {
      const data = await res.json();
      console.log(`Response from token validation: ${JSON.stringify(data)}`);
      if (!data.access_token) throw new Error('Token not found ---');
      response.cookies.set('access_token', data.access_token);
      return true;
    })
    .catch((err) => {
      if (err instanceof Error) console.log(err.message);
      return false;
    });
  const token = response.cookies.get('access_token')?.value;
  const decode = token ? (jwtDecode(token) as { user: TUser }) : undefined;
  const isCustomer = decode?.user?.role === 'user' ? true : false;
  const isSuperAdmin = decode?.user?.role === 'superAdmin';
  const isStoreAdmin = decode?.user?.role === 'storeAdmin';
  if (!isLogin) {
    if (pathname !== '/login' && pathname !== '/signUp') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } else {
    if (isSuperAdmin) {
      if (pathname === '/login' || pathname === '/signUp' || pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      if (pathname === '/dashboard') {
        return response;
      }
    } else if (isStoreAdmin) {
      if (pathname === '/' || pathname === '/login' || pathname === '/signUp') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      if (pathname === '/dashboard') {
        return response;
      }
    } else if (isCustomer) {
      if (pathname === '/login' || pathname === '/signUp') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }
  return response;
}
export const config = {
  matcher: [
    '/login',
    '/auth',
    '/dashboard',
    '/verification',
    '/signUp',
    '/admin',
    '/',
  ],
};
