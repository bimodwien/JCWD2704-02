export type TUser = {
  id: string | null;
  name: string | null;
  email: string;
  isVerified?: boolean | null;
  role: 'superAdmin' | 'storeAdmin' | 'user' | null;
};
