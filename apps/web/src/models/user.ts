export type TUser = {
  id: string | null;
  name: string | null;
  email: string;
  isVerified?: boolean | null;
  role: 'superAdmin' | 'storeAdmin' | 'user' | null;
  store: TStore;
  Cart: [TCart];
};

export type TStore = {
  id: string;
  name: string;
};

type TCart = {};
