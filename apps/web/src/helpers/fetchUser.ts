import { axiosInstance } from '@/lib/axios';
import { TUser } from '@/models/user';

export async function fetchUser(
  page: number,
  limit: number,
  name: string,
  setData: (value: React.SetStateAction<TUser[]>) => void,
) {
  const axios = axiosInstance();
  const queryParams: Record<string, any> = {
    page,
    limit,
    name,
  };
  try {
    const response = await axios.get('/admins', {
      params: { ...queryParams },
    });
    const userData = response.data;
    setData(userData.data.data);
    console.log('====================================');
    console.log(userData.data.data);
    console.log('====================================');
  } catch (error) {
    console.log(error);
  }
}

export async function deleteUser(
  id: string,
  page: number,
  limit: number,
  name: string,
  setData: (value: React.SetStateAction<TUser[]>) => void,
) {
  const axios = axiosInstance();
  try {
    await axios.delete(`/admins/${id}`);
    alert('data berhasil dihapus');
    fetchUser(page, limit, name, setData);
  } catch (error) {
    console.log(error);
  }
}

export async function updateProfile(
  id: string,
  profileData: { email: string; name: string; profilePicture: string },
) {
  const axios = axiosInstance();

  try {
    const response = await axios.patch(
      `/v1/update-profile/${id}`,
      profileData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data;
  } catch (error) {
    console.log('====================================');
    console.log(error);
    console.log('====================================');
  }
}
