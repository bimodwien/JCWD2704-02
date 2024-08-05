import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { TUser } from './models/user';

export async function middleware(request: NextRequest) {
  // const refresh_token = request.cookies.get('access_token')?.value || '';
  const refresh_token = request.cookies.get('refresh_token')?.value || '';
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  console.log('refresh_token: ', refresh_token);

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

  console.log('isLogin: ', isLogin);

  const token = response.cookies.get('access_token')?.value;

  console.log(`Access Token: ${token}`);

  const decode = token ? (jwtDecode(token) as { user: TUser }) : undefined;

  console.log(`Decoded Token: ${JSON.stringify(decode)}`);

  const isCustomer = decode?.user?.role === 'user' ? true : false;
  const isSuperAdmin = decode?.user?.role === 'superAdmin';
  const isStoreAdmin = decode?.user?.role === 'storeAdmin';

  console.log(
    `Roles - isCustomer: ${isCustomer}, isSuperAdmin: ${isSuperAdmin}, isStoreAdmin: ${isStoreAdmin}`,
  );

  // if (!isSuperAdmin && pathname.startsWith('/dashboard')) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // } else if (
  //   (pathname == '/login' || pathname == '/register') &&
  //   isLogin &&
  //   isCustomer
  // )
  //   return NextResponse.redirect(new URL('/', request.url));
  // else if ((pathname == '/' || pathname.startsWith('/dashboard')) && !isLogin)
  //   return NextResponse.redirect(new URL('/login', request.url));
  // else if (pathname == '/' && isLogin && !isCustomer)
  //   return NextResponse.redirect(new URL('/dashboard', request.url));
  // else if (pathname == '/' && isLogin && isStoreAdmin)
  //   return NextResponse.redirect(new URL('/dashboard', request.url));
  // else if (pathname == '/dashboard' && isLogin && isStoreAdmin) {
  //   return response;
  // }
  // return response;
  if (!isLogin) {
    console.log('User is not logged in');
    if (pathname !== '/login' && pathname !== '/signUp') {
      console.log('Redirecting to /login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } else {
    if (isSuperAdmin) {
      console.log('SuperAdmin is logged in');
      if (pathname === '/login' || pathname === '/signUp') {
        console.log('Redirecting SuperAdmin to /dashboard');
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } else if (isStoreAdmin) {
      console.log('StoreAdmin is logged in');
      if (pathname === '/' || pathname === '/login' || pathname === '/signUp') {
        console.log('Redirecting StoreAdmin to /dashboard');
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } else if (isCustomer) {
      console.log('Customer is logged in');
      if (pathname === '/login' || pathname === '/signUp') {
        console.log('Redirecting Customer to /');
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  console.log('Default response');
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
