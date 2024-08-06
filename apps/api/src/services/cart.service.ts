import { Request } from 'express';
import prisma from '@/prisma';
import { TCart } from '@/models/cart.model';
import haversine from 'haversine';
import { MAX_DISTANCE } from '@/utils/maxDistance';
import { TStore } from '@/models/store.model';
import { TStock } from '@/models/product.model';

class CartService {
  async addCart(req: Request) {
    const { productId, quantity, storeId } = req.body as TCart;
    const userId = req.user.id;

    if (Number(quantity) <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { latitude: true, longitude: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { Stock: { where: { productId: productId } } },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    const checkStock = store.Stock.find(
      (stock: TStock) => stock.productId === productId,
    );

    if (!checkStock) {
      throw new Error(
        'Stock not found for the selected product in the chosen store',
      );
    }

    const now = new Date();
    const productDiscounts = await prisma.productDiscount.findMany({
      where: {
        productId: productId,
        storeId: storeId,
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

    const carts = await prisma.cart.findMany({
      where: { userId: userId },
    });

    await Promise.all(
      carts.map(async (cart: TCart) => {
        const stock = await prisma.stock.findFirst({
          where: { productId: cart.productId, storeId: storeId },
        });

        if (!stock) {
          await prisma.cart.update({
            where: { id: cart.id },
            data: {
              stockId: null,
              storeId: storeId,
            },
          });
        } else {
          await prisma.cart.update({
            where: { id: cart.id },
            data: {
              storeId: storeId,
              stockId: stock.id,
            },
          });
        }
      }),
    );

    // Check if the cart item already exists
    const existingCart = await prisma.cart.findFirst({
      where: { userId: userId, productId: productId, storeId: storeId },
    });

    if (existingCart) {
      const updatedCart = await prisma.cart.update({
        where: { id: existingCart.id },
        data: {
          quantity: existingCart.quantity + Number(quantity),
          stockId: checkStock.id,
        },
      });
      return updatedCart;
    }

    // Add new cart item
    const newCart = await prisma.cart.create({
      data: {
        userId: userId,
        productId: productId,
        storeId: storeId,
        quantity: Number(quantity),
        stockId: checkStock.id,
      },
    });

    return newCart;
  }

  private async findClosestStore(userId: string, productId: string) {
    const userAddress = await prisma.address.findFirst({
      where: { userId: userId, isChosen: true },
    });

    if (
      !userAddress ||
      userAddress.latitude === null ||
      userAddress.longitude === null
    ) {
      throw new Error(
        'No chosen address found for user or address is incomplete',
      );
    }

    const stores = await prisma.store.findMany({
      include: { Stock: true },
      // include: { Stock: { where: { productId: productId } } },
    });

    let closestStore = null;
    let minDistance = Infinity;

    for (const store of stores) {
      // if (store.Stock.length === 0) continue;

      if (store.latitude === null || store.longitude === null) {
        continue;
      }

      const distance = haversine(
        { latitude: userAddress.latitude, longitude: userAddress.longitude },
        { latitude: store.latitude, longitude: store.longitude },
        { unit: 'meter' },
      );

      if (distance < minDistance && distance <= MAX_DISTANCE) {
        minDistance = distance;
        closestStore = store;
      }
    }

    return closestStore;
  }

  async updateAddress(req: Request) {
    const userId = req.user.id;
    const { addressId } = req.body;

    await prisma.address.updateMany({
      where: { userId: userId, isChosen: true },
      data: { isChosen: false },
    });

    await prisma.address.update({
      where: { id: addressId },
      data: { isChosen: true },
    });

    await this.updateStoreForCart(req);
  }

  async updateStoreForCart(req: Request) {
    const userId = req.user.id;
    const carts = await prisma.cart.findMany({
      where: { userId: userId },
    });

    for (const cart of carts) {
      const closestStore = await this.findClosestStore(userId, cart.productId);

      if (!closestStore) {
        console.warn(
          `Tidak ada toko ditemukan dalam jarak maksimum untuk produk ${cart.productId}`,
        );
        continue;
      }

      const checkStock = await prisma.stock.findFirst({
        where: { productId: cart.productId, storeId: closestStore.id },
      });

      if (!checkStock) {
        await prisma.cart.update({
          where: { id: cart.id },
          data: {
            stockId: null,
            storeId: closestStore.id,
          },
        });
      } else {
        await prisma.cart.update({
          where: { id: cart.id },
          data: {
            storeId: closestStore.id,
            stockId: checkStock.id,
          },
        });
      }
    }
  }
}

export default new CartService();
