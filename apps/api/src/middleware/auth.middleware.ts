'use strict';

import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { TDecode, TUser } from '../models/user.model';
import { SECRET_KEY } from '@/config/config';

export const validateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const decode = verify(token!, SECRET_KEY) as TDecode;
    if (decode.role != 'access-token') throw new Error('invalid token');
    req.user = decode.user;

    console.log(req.user, decode.user);

    next();
  } catch (error) {
    next(error);
  }
};

export const validateRefreshToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    const decode = verify(token!, SECRET_KEY) as TDecode;
    if (decode.role != 'refresh-token') throw new Error('invalid token');
    req.user = decode.user;

    next();
  } catch (error) {
    next(error);
  }
};
