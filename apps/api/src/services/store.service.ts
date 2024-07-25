import prisma from '@/prisma';
import { Request } from 'express';

class StoreService {
  async createStore(req: Request) {
    const {
      name,
      address,
      latitude,
      longitude,
      type,
      cityName,
      province,
      postalCode,
    } = req.body;

    return await prisma.$transaction(async (prisma) => {
      const checkCity = await prisma.city.findFirst({
        where: {
          cityName,
        },
      });

      if (!checkCity) {
        throw new Error(
          'City with the specified type not found in the database',
        );
      }

      const store = await prisma.store.create({
        data: {
          name,
          address,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          type,
          city: checkCity.cityName,
          province,
          postalCode: Number(postalCode),
          userId: 'clysewzso00019bltljoq9b95',
        },
      });

      return store;
    });
  }

  async getStoresAll(req: Request) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const data = await prisma.store.findMany({
      skip: skip,
      take: limit,
      select: {
        id: true,
        name: true,
        city: true,
      },
    });

    const total = await prisma.store.count();
    return {
      data: data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export default new StoreService();
