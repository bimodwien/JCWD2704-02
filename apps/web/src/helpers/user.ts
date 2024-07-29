import { axiosInstance } from '@/lib/axios';
import { TUser } from '@/models/user';

export async function updatePassword(
  id: string,
  password: string,
  confirmPassword: string,
) {
  try {
    return await axiosInstance().patch(`/v1/update-password/${id}`, {
      password,
      confirmPassword,
    });
  } catch (error) {
    console.log('====================================');
    console.log(error);
    console.log('====================================');
  }
}
