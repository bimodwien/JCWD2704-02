export type TUser = {
  id: string;
  name: string | null;
  email: string;
  isVerified?: boolean | null;
  role: 'superAdmin' | 'storeAdmin' | 'user' | null;
};
