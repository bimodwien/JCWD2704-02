import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { TUser } from './models/user';

export async function middleware(request: NextRequest) {
  const refresh_token = request.cookies.get('refresh_token')?.value || '';
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  const isLogin = await fetch('http://localhost:8000/api/v1/v3', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${refresh_token}`,
    },
  })
    .then(async (res) => {
      const data = await res.json();
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

  const hasCart =
    decode?.user?.Cart && Object.keys(decode.user.Cart).length > 0;
  const isCustomer = decode?.user?.role === 'user' ? true : false;
  const isSuperAdmin = decode?.user?.role === 'superAdmin' ? true : false;
  const isStoreAdmin = decode?.user?.role === 'storeAdmin' ? true : false;

  if (!isLogin && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', request.url));
  } else if (
    !isLogin &&
    (pathname == '/cart' ||
      pathname == '/checkout' ||
      pathname.startsWith('/order') ||
      pathname.startsWith('/dashboard'))
  ) {
    return NextResponse.redirect(new URL('/', request.url));
  } else if (
    isLogin &&
    (isSuperAdmin || isStoreAdmin) &&
    (pathname == '/' ||
      pathname == '/cart' ||
      pathname == '/checkout' ||
      pathname.startsWith('/order') ||
      pathname.startsWith('/detail'))
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } else if (
    isLogin &&
    isCustomer &&
    (pathname.startsWith('/dashboard') ||
      pathname == '/login' ||
      pathname == '/signUp')
  ) {
    return NextResponse.redirect(new URL('/', request.url));
  } else if (isLogin && isCustomer && !hasCart && pathname == '/checkout') {
    return NextResponse.redirect(new URL('/cart', request.url));
  } else if (
    isLogin &&
    isStoreAdmin &&
    (pathname == '/dashboard/admin' || pathname == '/dashboard/store')
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
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
    '/',
    '/order/:path*',
    '/detail/:path*',
    '/cart',
    '/checkout',
    '/dashboard/:path*',
    '/dashboard/admin',
    '/dashboard/store',
  ],
};

// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import { jwtDecode } from 'jwt-decode';
// import { TUser } from './models/user';

// export async function middleware(request: NextRequest) {
//   const refresh_token = request.cookies.get('refresh_token')?.value || '';
//   const response = NextResponse.next();
//   const { pathname } = request.nextUrl;

//   try {
//     const isLogin = await fetch('http://localhost:8000/v1/v3', {
//       method: 'GET',
//       headers: {
//         Authorization: `Bearer ${refresh_token}`,
//       },
//     })
//       .then(async (res) => {
//         if (!res.ok) throw new Error('Network response was not ok');
//         const data = await res.json();
//         if (!data.access_token) throw new Error('Token not found');
//         response.cookies.set('access_token', data.access_token);
//         return true;
//       })
//       .catch((err) => {
//         console.error(err.message);
//         return false;
//       });

//     const token = response.cookies.get('access_token')?.value;
//     const decode = token ? jwtDecode<{ user: TUser }>(token) : undefined;

//     const hasCart =
//       Array.isArray(decode?.user?.Cart) && decode.user.Cart.length > 0;
//     const isCustomer = decode?.user?.role === 'user';
//     const isSuperAdmin = decode?.user?.role === 'superAdmin';
//     const isStoreAdmin = decode?.user?.role === 'storeAdmin';

//     if (!isLogin && pathname.startsWith('/dashboard')) {
//       return NextResponse.redirect(new URL('/', request.url));
//     } else if (
//       !isLogin &&
//       (pathname === '/cart' ||
//         pathname === '/checkout' ||
//         pathname.startsWith('/order') ||
//         pathname.startsWith('/dashboard'))
//     ) {
//       return NextResponse.redirect(new URL('/', request.url));
//     } else if (
//       isLogin &&
//       (isSuperAdmin || isStoreAdmin) &&
//       (pathname === '/cart' ||
//         pathname === '/checkout' ||
//         pathname.startsWith('/order') ||
//         pathname === '/' ||
//         pathname.startsWith('/detail'))
//     ) {
//       return NextResponse.redirect(new URL('/dashboard', request.url));
//     } else if (
//       isLogin &&
//       isCustomer &&
//       (pathname.startsWith('/dashboard') ||
//         pathname === '/login' ||
//         pathname === '/signUp')
//     ) {
//       return NextResponse.redirect(new URL('/', request.url));
//     } else if (isLogin && isCustomer && !hasCart && pathname === '/checkout') {
//       return NextResponse.redirect(new URL('/cart', request.url));
//     } else if (
//       isLogin &&
//       isStoreAdmin &&
//       (pathname === '/dashboard/admin' || pathname === '/dashboard/store')
//     ) {
//       return NextResponse.redirect(new URL('/dashboard', request.url));
//     }
//   } catch (error) {
//     console.error('Error in middleware:', error);
//   }

//   return response;
// }

// export const config = {
//   matcher: [
//     '/login',
//     '/auth',
//     '/dashboard',
//     '/verification',
//     '/signUp',
//     '/',
//     '/order/:path*',
//     '/detail/:path*',
//     '/cart',
//     '/checkout',
//     '/dashboard/:path*',
//     '/dashboard/admin',
//     '/dashboard/store',
//   ],
// };
