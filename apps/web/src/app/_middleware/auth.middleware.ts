import { Dispatch } from '@reduxjs/toolkit';
import { TUser } from '../../models/user.model';
import { login } from '../../app/_lib/redux/slice/user.slice';
import { setAuthCookie } from '../_lib/cookies';
import { deleteCookie, getCookie } from 'cookies-next';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { axiosInstance } from '@/lib/axios';

export const userLogin = ({ email, password }: TUser) => {
  return async (dispatch: Dispatch) => {
    try {
      await axiosInstance().post(
        '/v1/signIn',
        {
          email,
          password,
        },
        {
          withCredentials: true,
        },
      );

      const access_token = getCookie('access_token') || '';
      if (access_token) {
        const user: TUser = jwtDecode(access_token);
        dispatch(login(user));
      }
      return;
    } catch (err) {
      if (err instanceof Error) {
        deleteCookie('access_token');
        deleteCookie('refresh_token');
        return err.message;
      }
    }
  };
};

export const keepLogin = () => {
  return async (dispatch: Dispatch) => {
    try {
      const token = getCookie('access_token');
      if (!token) throw new Error('token not found');

      const user = jwtDecode(token) as TUser;

      if (user.id) {
        dispatch(login(user));
      }
      return {
        success: true,
        message: 'success',
      };
    } catch (err: any) {
      console.log(err);
      // deleteCookie("access_token");
      // deleteCookie("refresh_token");

      return err.message;
    }
  };
};

export const loginByGoogle = (email: string) => {
  return async (dispatch: Dispatch) => {
    try {
      await axiosInstance().post(
        '/v1/signInWithGoogle',
        { email },
        { withCredentials: true },
      );

      const access_token = getCookie('access_token') || '';
      if (access_token) {
        const user: TUser = jwtDecode(access_token);
        dispatch(login(user));
      }
      return;
    } catch (err) {
      if (err instanceof Error) {
        deleteCookie('access_token');
        deleteCookie('refresh_token');
        return err.message;
      }
    }
  };
};
