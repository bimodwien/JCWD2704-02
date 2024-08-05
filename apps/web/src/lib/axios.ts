import axios, { AxiosInstance } from 'axios';
import { getCookie } from 'cookies-next';

export function axiosInstance(): AxiosInstance {
  const token = getCookie('access_token') || '';
  return axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
      Authorization: 'Bearer ' + token,
    },
    withCredentials: true,
  });
}
