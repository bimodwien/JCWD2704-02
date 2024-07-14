import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { AxiosError } from 'axios';
import { axiosInstance } from './app/_lib/axios';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('refresh_token')?.value || '';
  const response = NextResponse.next();
  const validate = await axiosInstance()
    .get('/user/validate', {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then((res) => {
      response.cookies.set('access_token', res.data.access_token);
      return true;
    })
    .catch((err) => {
      if (err instanceof AxiosError) console.log(err.response?.data);
      return false;
    });
  //   const is_verified = res.is_verified;
  let userType = '';
  const access_token = response.cookies.get('access_token')?.value;
  if (access_token) {
    const decodedToken: any = jwtDecode(access_token);
    userType = decodedToken?.type || '';
    // Mengambil ID dari token JWT dan menyimpannya dalam userType
    // userType = decodedToken?.id || "";
    // console.log("ID dari token JWT:", userType); // Menampilkan isi dari ID
  }
  if ((pathname == '/admin' || pathname.startsWith('/profile')) && !validate) {
    return NextResponse.redirect(new URL('/login', request.url));
  } else if ((pathname == '/login' || pathname == '/register') && validate) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  return response;
}
export const config = {
  matcher: ['/auth', '/login', '/verification', '/register', '/admin', '/'],
};
