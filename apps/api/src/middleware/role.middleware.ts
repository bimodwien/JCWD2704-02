import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export const verifySuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user?.id;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user || user.role !== 'superAdmin') {
    return res.status(403).json({
      message: 'Unauthorized: Only superAdmin can accses',
    });
  }

  next();
};

export const verifyStoreAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user?.id;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user || user.role !== 'storeAdmin') {
    return res.status(403).json({
      message: 'Unauthorized: Only store admin can accses',
    });
  }

  next();
};

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user?.id;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user || user.role !== 'user') {
    return res.status(403).json({
      message: 'Unauthorized: Only customer can accses.',
    });
  }

  next();
};
