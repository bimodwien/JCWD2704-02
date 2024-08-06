import { TCart } from '@/models/cart.model';
import { TStore } from '@/models/store.model';
import prisma from '@/prisma';
import { MAX_DISTANCE } from '@/utils/maxDistance';
import { Request } from 'express';
import haversine from 'haversine';

class CartData {
  async getByUser(req: Request) {
    const userId = req.user.id;
    const now = new Date();

    const data = await prisma.cart.findMany({
      where: {
        userId: userId,
      },
      include: {
        product: { include: { ProductImage: { select: { id: true } } } },
        store: true,
        stock: {
          include: {
            ProductDiscount: {
              where: {
                startDate: { lte: now },
                endDate: { gte: now },
                category: 'buyGet',
              },
            },
          },
        },
      },
    });
    return data;
  }

  async sumCart(req: Request) {
    const userId = req.user.id;
    const totalQuantity = await prisma.cart.aggregate({
      where: {
        userId: userId,
      },
      _sum: {
        quantity: true,
      },
    });
    return totalQuantity._sum?.quantity || 0;
  }

  async updateCart(req: Request) {
    const { cartId } = req.params;
    const { quantity } = req.body as TCart;
    const userId = req.user.id;

    const checkCart = await prisma.cart.findUnique({
      where: { id: cartId },
    });

    if (!checkCart || checkCart.userId !== userId) {
      throw new Error('Cart not found');
    }

    const checkStock = await prisma.stock.findFirst({
      where: {
        productId: checkCart.productId,
        storeId: checkCart.storeId,
      },
      select: { quantity: true },
    });

    if (!checkStock) {
      throw new Error('Stock is empty');
    }

    const now = new Date();
    const productDiscounts = await prisma.productDiscount.findMany({
      where: {
        productId: checkCart.productId,
        storeId: checkCart.storeId,
        category: 'buyGet',
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    if (productDiscounts.length > 0) {
      const maxQuantity = Math.floor(checkStock.quantity / 2);
      if (Number(quantity) > maxQuantity) {
        throw new Error(
          `Quantity cannot exceed ${maxQuantity} for buy one get one discount`,
        );
      }
    }

    if (checkStock.quantity < quantity) {
      throw new Error('Not enough stock available');
    }

    const updateCart = await prisma.cart.update({
      where: { id: cartId },
      data: { quantity: Number(quantity) },
    });

    return updateCart;
  }

  async delete(req: Request) {
    const { cartId } = req.params;
    const userId = req.user.id;

    const deletedCart = await prisma.cart.delete({
      where: { id: cartId, userId: userId },
    });

    return deletedCart;
  }

  async getStore(req: Request) {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { latitude: true, longitude: true },
    });

    if (!user || user.latitude === null || user.longitude === null) {
      throw new Error('User location not found');
    }

    const { latitude: userLatitude, longitude: userLongitude } = user;

    const allStores = await prisma.store.findMany({
      select: { id: true, name: true, latitude: true, longitude: true },
    });

    const nearbyStores = allStores
      .map((store: any) => {
        if (store.latitude === null || store.longitude === null) {
          return null;
        }

        const { latitude: storeLatitude, longitude: storeLongitude } = store;

        const distance = haversine(
          { latitude: userLatitude, longitude: userLongitude },
          { latitude: storeLatitude, longitude: storeLongitude },
          { unit: 'meter' },
        );

        const formattedDistance = (distance / 1000).toFixed(1);

        return {
          ...store,
          distance: parseFloat(formattedDistance),
        };
      })
      .filter((store: any) => store && store.distance <= MAX_DISTANCE / 1000);

    return nearbyStores;
  }

  async getStock(req: Request) {
    const { storeId, productId } = req.query;

    if (!storeId || typeof storeId !== 'string') {
      throw new Error('Invalid or missing storeId');
    }
    if (!productId || typeof productId !== 'string') {
      throw new Error('Invalid or missing productId');
    }

    const now = new Date();

    const stock = await prisma.stock.findFirst({
      where: {
        storeId: storeId,
        productId: productId,
      },
      include: {
        ProductDiscount: {
          where: {
            startDate: {
              lte: now,
            },
            endDate: {
              gte: now,
            },
          },
        },
      },
    });

    return stock;
  }

  async getVoucher(req: Request) {
    const userId = req.user.id;
    const now = new Date();

    const userCart = await prisma.cart.findMany({
      where: { userId: userId },
      select: { productId: true, storeId: true },
    });

    const productIds = userCart.map((cart: any) => cart.productId);
    const storeIds = userCart.map((cart: any) => cart.storeId);

    const userVouchers = await prisma.voucherUser.findMany({
      where: {
        userId: userId,
        voucher: {
          startDate: { lt: now },
          endDate: { gt: now },
          storeId: { in: storeIds },
        },
      },
      include: { voucher: true },
    });

    const productVouchers = await prisma.voucher.findMany({
      where: {
        category: 'product',
        startDate: { lt: now },
        endDate: { gt: now },
        productId: { in: productIds },
        storeId: { in: storeIds },
      },
    });

    const combinedVouchers = {
      userVouchers,
      productVouchers,
    };

    return combinedVouchers;
  }
}

export default new CartData();
