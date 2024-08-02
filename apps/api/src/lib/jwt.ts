import { sign } from 'jsonwebtoken';
import { SECRET_KEY } from '../config/config';

export const createToken = (payload: any, expiresIn: string = '1hr') => {
  return sign(payload, SECRET_KEY);
};
