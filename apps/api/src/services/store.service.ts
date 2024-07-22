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
          userId: 'superAdmin',
        },
      });

      return store;
    });
  }

  async updateStore(req: Request) {
    const { storeId } = req.params;
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

      const store = await prisma.store.update({
        where: { id: storeId },
        data: {
          name,
          address,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          type,
          city: checkCity.cityName,
          province,
          postalCode: Number(postalCode),
        },
      });

      return store;
    });
  }

  async softDeleteStore(req: Request) {
    const { id } = req.params;
    return await prisma.store.update({
      where: {
        id: id,
      },
      data: {
        isDeleted: true,
      },
    });
  }

  async getStoresAll(req: Request) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const data = await prisma.store.findMany({
      skip: skip,
      take: limit,
      where: {
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        city: true,
      },
    });

    const total = await prisma.store.count();
    return {
      where: {
        isDeleted: false,
      },
      data: data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStoresByStoreID(req: Request) {
    const { id } = req.params;

    const data = await prisma.store.findFirst({
      where: {
        id: id,
      },
    });

    return data;
  }

  async getAvailableStores() {
    const stores = await prisma.store.findMany({
      where: { isChosen: false },
      select: {
        id: true,
        name: true,
      },
    });
    return stores;
  }
}

export default new StoreService();
