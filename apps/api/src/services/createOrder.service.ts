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

      const now = new Date();
      const productDiscounts = await prisma.productDiscount.findMany({
        where: {
          productId: item.productId,
          storeId: item.storeId,
          category: 'buyGet',
          startDate: { lte: now },
          endDate: { gte: now },
        },
      });

      if (productDiscounts.length > 0) {
        const maxQuantity = Math.floor(stock.quantity / 2);
        if (Number(item.quantity) > maxQuantity) {
          throw new Error(
            `Quantity cannot exceed ${maxQuantity} for buy one get one discount`,
          );
        }
      }
    }
  }

  async createOrder(req: Request) {
    const userId = req.user.id;
    const { paidType, addressId, voucherId } = req.body as TOrder;

    const validVoucherId = voucherId !== null ? voucherId : undefined;
    const now = new Date();

    if (validVoucherId) {
      const voucher = await prisma.voucher.findUnique({
        where: {
          id: validVoucherId,
          startDate: { lte: now },
          endDate: { gte: now },
        },
      });

      if (!voucher) {
        throw new Error('Invalid voucherId');
      }

      if (voucher.category !== 'product') {
        const voucherUser = await prisma.voucherUser.findFirst({
          where: { voucherId: validVoucherId, userId, isUsed: false },
        });

        if (!voucherUser)
          throw new Error('Voucher user not found or voucher already used');
      }
    }

    const cart = await prisma.cart.findMany({
      where: { userId: userId },
      include: { product: true, store: true, stock: true },
    });

    if (cart.length === 0) {
      throw new Error('Cart is empty, cannot create order');
    }

    await this.checkStock(cart);

    let totalPrice = 0;
    let discountPrice = 0;
    let shippingCost = 20000;
    const orderItemsData = await Promise.all(
      cart.map(async (item) => {
        let price = item.product.price * item.quantity;
        let quantity = item.quantity;
        let get: number | null = null;
        let normalPrice = item.product.price;
        let itemDiscountPrice: number | null = null;
        let hasBuyGet = false;
        let hasDiscount = false;

        const productDiscounts = await prisma.productDiscount.findMany({
          where: {
            productId: item.productId,
            storeId: item.storeId,
            startDate: { lte: now },
            endDate: { gte: now },
          },
        });

        for (const discount of productDiscounts) {
          if (discount.category === 'buyGet') {
            hasBuyGet = true;
            quantity = item.quantity * 2;
            get = quantity / 2;

            if (item.stock && quantity > item.stock.quantity) {
              quantity = item.quantity;
              get = quantity / 2;
            }
          } else if (discount.category === 'discount') {
            hasDiscount = true;
            const stock = await prisma.stock.findFirst({
              where: { productId: item.productId, storeId: item.storeId },
            });

            if (stock?.priceDiscount) {
              itemDiscountPrice = stock.priceDiscount;
            }
          }
        }

        if (hasBuyGet) {
          price = (quantity / 2) * (itemDiscountPrice ?? item.product.price);
        } else if (hasDiscount) {
          price = item.quantity * (itemDiscountPrice ?? item.product.price);
        }
        totalPrice += price;

        return {
          productId: item.productId,
          quantity: quantity,
          price: price,
          get: get,
          normalPrice: normalPrice,
          discountPrice: itemDiscountPrice,
        };
      }),
    );

    if (paidType !== 'manual' && paidType !== 'gateway') {
      throw new Error('Invalid payment type');
    }

    const storeIds = [...new Set(cart.map((item) => item.storeId))];

    if (validVoucherId) {
      const voucher = await prisma.voucher.findUnique({
        where: { id: validVoucherId },
      });

      if (voucher) {
        if (voucher.startDate > now || voucher.endDate < now) {
          throw new Error('Voucher is not valid at this time');
        }
        const voucherValue = voucher.value ?? 0;

        if (voucher.category === 'shippingCost') {
          shippingCost = 0;
        } else if (voucher.category === 'totalPurchase') {
          if (voucher.type === 'nominal') {
            discountPrice += Math.min(voucherValue, totalPrice);
            totalPrice -= discountPrice;
          } else if (voucher.type === 'percentage') {
            const discountAmount = (totalPrice * (voucherValue ?? 0)) / 100;
            discountPrice += Math.min(discountAmount, voucher.maxDiscount ?? 0);
            totalPrice -= discountPrice;
          }
        } else if (voucher.category === 'product') {
          if (voucher.type === 'nominal') {
            discountPrice += Math.min(voucherValue, totalPrice);
            totalPrice -= discountPrice;
          } else if (voucher.type === 'percentage') {
            const discountAmount = (totalPrice * (voucherValue ?? 0)) / 100;
            discountPrice += Math.min(discountAmount, voucher.maxDiscount ?? 0);
            totalPrice -= discountPrice;
          }
        }

        if (totalPrice < 0) {
          totalPrice = 0;
        }
      }
    }

    discountPrice = Math.round(discountPrice);
    totalPrice += shippingCost;
    totalPrice = Math.round(totalPrice);

    const createdOrder = await prisma.order.create({
      data: {
        invoice: generateInvoice(),
        userId: userId,
        totalPrice,
        addressId,
        status: 'waitingPayment',
        paidType,
        storeId: storeIds[0],
        shippingCost: shippingCost,
        OrderItem: {
          createMany: { data: orderItemsData },
        },
        voucherId: validVoucherId,
        discountPrice,
      },
    });

    await prisma.address.updateMany({
      where: { userId: userId },
      data: { isChosen: false },
    });

    if (validVoucherId) {
      await prisma.voucherUser.updateMany({
        where: { voucherId: validVoucherId },
        data: { isUsed: true },
      });
    }

    if (paidType === 'gateway') {
      const snapToken = await this.createSnapToken(createdOrder, cart);
      return { token: snapToken, createdOrder };
    }

    await this.cartAndStock(createdOrder.id, createdOrder.storeId, cart);
    return createdOrder;
  }

  private async createSnapToken(order: TOrder, cart: TCart[]): Promise<string> {
    try {
      // Retrieve order items
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: order.id },
        include: { product: true },
      });

      const user = await prisma.user.findUnique({
        where: { id: order.userId },
      });

      if (!user) throw new Error('User not found');

      // Initialize Midtrans Snap client
      const snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: process.env.SERVER_KEY,
        clientKey: process.env.CLIENT_KEY,
      });

      // Default values for shipping cost and discount
      const shippingCost = order.shippingCost ?? 0;
      const discountPrice = order.discountPrice ?? 0;

      const itemDetails = orderItems.flatMap((item) => {
        const get = item.get ?? 0; // Default to 0 if get is null
        const quantity = item.quantity - get; // Calculate quantity considering get
        const pricePerItem = item.price / quantity; // Calculate price per item

        // Main item detail
        const mainItemDetail = {
          id: item.product.id,
          price: Math.round(pricePerItem),
          quantity: quantity,
          name: item.product.name,
        };

        // If there's a free item due to buy 1 get 1
        const freeItemDetails =
          get > 0
            ? {
                id: `${item.product.id}_free`,
                price: 0, // Price for free item
                quantity: get,
                name: `${item.product.name} (Free)`,
              }
            : null;

        return freeItemDetails
          ? [mainItemDetail, freeItemDetails]
          : [mainItemDetail];
      });

      itemDetails.push({
        id: 'shipping_cost',
        price: shippingCost,
        quantity: 1,
        name: 'Shipping Cost',
      });
      itemDetails.push({
        id: 'discount',
        price: -discountPrice,
        quantity: 1,
        name: 'Discount',
      });

      const orderData = {
        transaction_details: {
          order_id: order.invoice,
          gross_amount: order.totalPrice,
        },
        item_details: itemDetails,
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

      await this.cartAndStock(order.id, order.storeId, cart);

      return snapToken;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw new Error('Failed to initiate payment');
    }
  }

  private async cartAndStock(
    orderId: string,
    storeId: string,
    cart: TCart[],
  ): Promise<void> {
    const cartIdsToDelete = cart.map((item) => item.id);
    await prisma.cart.deleteMany({
      where: { id: { in: cartIdsToDelete } },
    });

    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: orderId },
    });

    for (const orderItem of orderItems) {
      const updatedStock = await prisma.stock.update({
        where: {
          productId_storeId: {
            productId: orderItem.productId,
            storeId: storeId,
          },
        },
        data: {
          quantity: { decrement: orderItem.quantity },
        },
      });

      const stock = await prisma.stock.findUnique({
        where: {
          productId_storeId: {
            productId: orderItem.productId,
            storeId: storeId,
          },
        },
      });

      if (stock) {
        await prisma.stockHistory.create({
          data: {
            quantityChange: orderItem.quantity,
            reason: 'orderPlacement',
            changeType: 'out',
            productId: orderItem.productId,
            stockId: stock.id,
            storeId: storeId,
            orderId: orderId,
          },
        });
      } else {
        throw new Error(
          ` stock not found for product ${orderItem.productId} and store ${storeId}`,
        );
      }
    }
  }

  async shippingAddress(req: Request) {
    const { filter } = req.query;
    const userId = req.user.id;

    let address;
    if (filter === 'all') {
      address = await prisma.address.findMany({
        where: { userId: userId },
      });
    } else if (filter === 'chosen') {
      address = await prisma.address.findFirst({
        where: { userId: userId, isChosen: true },
      });
    } else {
      throw new Error('Invalid filter value');
    }

    return address;
  }
}

export default new CreateOrderService();
