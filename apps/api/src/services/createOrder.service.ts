import { Request } from 'express';
import prisma from '@/prisma';
import { TOrder } from '@/models/order.model';
import { TCart } from '@/models/cart.model';
const midtransClient = require('midtrans-client');

class CreateOrderService {
  private generateInvoice(): string {
    const timestamp = new Date().getTime().toString(36).toUpperCase();
    const randomChars = Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase();
    return `${timestamp}${randomChars}`;
  }

  async checkStock(cart: any[]) {
    for (const item of cart) {
      const stock = await prisma.stock.findFirst({
        where: {
          productId: item.productId,
          storeId: item.storeId,
        },
        select: {
          quantity: true,
        },
      });

      if (!stock || stock.quantity < item.quantity) {
        throw new Error('Not enough stock');
      }
    }
  }

  async createOrder(req: Request) {
    const { userId } = req.params;
    const { addressId, paidType } = req.body as TOrder;

    const cart = await prisma.cart.findMany({
      where: {
        userId: userId,
      },
      include: {
        product: true,
        store: true,
      },
    });

    await this.checkStock(cart);

    let totalPrice = 0;
    cart.forEach((item) => {
      totalPrice += item.product.price * item.quantity;
    });

    const invoice = this.generateInvoice();
    const validPaidType = paidType === 'gateway' ? 'gateway' : 'manual';

    const createdOrder = await prisma.order.create({
      data: {
        invoice,
        userId,
        totalPrice,
        addressId,
        status: 'waitingPayment',
        paidType: validPaidType,
        OrderItem: {
          createMany: {
            data: cart.map((item) => ({
              productId: item.productId,
              storeId: item.storeId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
      },
    });

    if (paidType === 'gateway') {
      const snapToken = await this.createSnapToken(createdOrder, cart);
      return { token: snapToken };
    }

    await this.cartAndStock(cart);
    return createdOrder;
  }

  private async createSnapToken(order: TOrder, cart: TCart[]): Promise<string> {
    const orderItem = await prisma.orderItem.findMany({
      where: {
        orderId: order.id,
      },
      include: {
        product: true,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: order.userId },
    });

    if (!user) throw new Error('user not found');

    try {
      const snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: process.env.SERVER_KEY,
        clientKey: process.env.CLIENT_KEY,
      });

      const orderData = {
        transaction_details: {
          order_id: order.invoice,
          gross_amount: order.totalPrice,
        },
        item_details: orderItem.map((item) => ({
          id: item.product.id,
          price: item.product.price,
          quantity: item.quantity,
          name: item.product.name,
        })),
        customer_details: {
          first_name: user.name,
          email: user.email,
        },
      };

      const snapToken = await snap.createTransactionToken(orderData);

      await prisma.order.update({
        where: { invoice: order.invoice },
        data: { snap_token: snapToken },
      });

      await this.cartAndStock(cart);

      return snapToken;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw new Error('Failed to initiate payment');
    }
  }

  private async cartAndStock(cart: TCart[]): Promise<void> {
    const cartIdsToDelete = cart.map((item) => item.id);
    await prisma.cart.deleteMany({
      where: { id: { in: cartIdsToDelete } },
    });

    for (const item of cart) {
      await prisma.stock.update({
        where: {
          productId_storeId: {
            productId: item.productId,
            storeId: item.storeId,
          },
        },
        data: {
          quantity: { decrement: item.quantity },
        },
      });
    }
  }

  async shippingAddress(req: Request) {
    // const { userId } = req.params;
    // const address = await prisma.address.findFirst({
    //   where: { userId: userId, isPrimay: true },
    //   include: { city: true },
    // });
    // return address;
  }
}

export default new CreateOrderService();
