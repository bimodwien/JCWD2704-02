import type { Role } from '@prisma/client';

export type TUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  profilePicture: string;
  isVerified: boolean;
  role: Role;
  referralCode: string;
  referredCode: string;
  latitude: number;
  longitude: number;
};

export type TDecode = {
  type: string;
  user: TUser;
};
