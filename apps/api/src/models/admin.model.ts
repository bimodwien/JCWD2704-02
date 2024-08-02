import { Role } from '@prisma/client';

export type TUser = {
  id: string;
  name: string;
  email: string;
  password?: string;
  isVerified: boolean;
  role: Role;
  referralCode?: string;
  referredCode?: string;
};
