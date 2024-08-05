import { Request } from 'express';
import prisma from '@/prisma';
import { TCart } from '@/models/cart.model';

class CartService {
  async getByUser(req: Request) {
    // const { userId } = req.params;
    const userId = req.user.id;
    const data = await prisma.cart.findMany({
      where: {
        userId: userId,
      },
      include: {
        // product: true,
        product: { include: { ProductImage: { select: { id: true } } } },
        store: true,
        stock: true,
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

  async addCart(req: Request) {
    const { productId, storeId, quantity } = req.body as TCart;
    const userId = req.user.id;

    if (Number(quantity) <= 0) {
      throw new Error('quantity must be greater than 0');
    }

    const checkStock = await prisma.stock.findFirst({
      where: {
        productId: productId,
        storeId: storeId,
      },
      select: { quantity: true },
    });

    const checkCart = await prisma.cart.findFirst({
      where: {
        userId: userId,
        productId: productId,
        storeId: storeId,
      },
    });

    if (!checkStock) {
      throw new Error(`stock not found`);
    }

    const totalNeeded = Number(quantity) + Number(checkCart?.quantity || 0);

    if (checkStock.quantity <= 0) {
      throw new Error('stock is empty');
    } else if (checkStock.quantity < totalNeeded) {
      throw new Error('not enough stock available');
    }

    if (checkCart) {
      const updatedCart = await prisma.cart.update({
        where: { id: checkCart.id },
        data: { quantity: checkCart.quantity + Number(quantity) },
      });
      return updatedCart;
    }

    const newCart = await prisma.cart.create({
      data: {
        userId: userId,
        productId: productId,
        storeId: storeId,
        quantity: Number(quantity),
      },
    });
    return newCart;
  }

  async updateCart(req: Request) {
    const { cartId } = req.params;
    // const { quantity, userId } = req.body as TCart;
    const { quantity } = req.body as TCart;
    const userId = req.user.id;

    const checkCart = await prisma.cart.findUnique({
      where: { id: cartId, userId: userId },
    });

    if (!checkCart) {
      throw new Error('cart not found');
    }

    // if (quantity == 0) {
    //   const deleteCart = await prisma.cart.delete({
    //     where: { id: cartId },
    //   });
    //   return deleteCart;
    // }

    const checkStock = await prisma.stock.findFirst({
      where: {
        productId: checkCart.productId,
        storeId: checkCart.storeId,
      },
      select: { quantity: true },
    });

    if (!checkStock) {
      throw new Error('stock is empty');
    }

    if (checkStock.quantity < quantity) {
      throw new Error('not enough stock available');
    }

    const updateCart = await prisma.cart.update({
      // where: { id: cartId, userId: userId },
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
}

export default new CartService();
