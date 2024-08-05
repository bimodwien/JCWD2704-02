import { Request } from 'express';
import prisma from '@/prisma';
import { TOrder } from '@/models/order.model';
import { TCart } from '@/models/cart.model';
import { generateInvoice } from '@/utils/invoice';
const midtransClient = require('midtrans-client');

class CreateOrderService {
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
    const userId = req.user.id;
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

    if (cart.length === 0) {
      throw new Error('Cart is empty, cannot create order');
    }

    await this.checkStock(cart);

    let totalPrice = 0;
    const orderItemsData = cart.map((item) => {
      const price = item.product.price * item.quantity;
      totalPrice += price;
      return {
        productId: item.productId,
        // storeId: item.storeId,
        quantity: item.quantity,
        price: price,
      };
    });

    if (paidType !== 'manual' && paidType !== 'gateway')
      throw new Error('invalid paid type');

    const storeIds = [...new Set(cart.map((item) => item.storeId))];

    const createdOrder = await prisma.order.create({
      data: {
        invoice: generateInvoice(),
        userId,
        totalPrice: totalPrice,
        addressId,
        status: 'waitingPayment',
        paidType: paidType,
        storeId: storeIds[0],
        OrderItem: {
          createMany: {
            data: orderItemsData,
          },
        },
      },
    });

    if (paidType === 'gateway') {
      const snapToken = await this.createSnapToken(createdOrder, cart);
      return { token: snapToken, createdOrder };
    }

    await this.cartAndStock(createdOrder.id, cart);
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
      const redirectUrl = `https://app.sandbox.midtrans.com/snap/v4/redirection/${snapToken}`;
      await prisma.order.update({
        where: { invoice: order.invoice },
        data: {
          snap_token: snapToken,
          snap_redirect_url: redirectUrl,
        },
      });

      await this.cartAndStock(order.id, cart);

      return snapToken;
      // return redirectUrl;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw new Error('Failed to initiate payment');
    }
  }

  private async cartAndStock(orderId: string, cart: TCart[]): Promise<void> {
    const cartIdsToDelete = cart.map((item) => item.id);
    await prisma.cart.deleteMany({
      where: { id: { in: cartIdsToDelete } },
    });

    for (const item of cart) {
      const updatedStock = await prisma.stock.update({
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

      const stock = await prisma.stock.findUnique({
        where: {
          productId_storeId: {
            productId: item.productId,
            storeId: item.storeId,
          },
        },
      });

      if (stock) {
        await prisma.stockHistory.create({
          data: {
            quantityChange: item.quantity,
            reason: 'orderPlacement',
            changeType: 'out',
            productId: item.productId,
            stockId: stock.id,
            storeId: item.storeId,
            orderId: orderId,
          },
        });
      } else {
        throw new Error(
          `stock not found for product ${item.productId} and store ${item.storeId}`,
        );
      }
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
