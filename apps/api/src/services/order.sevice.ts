import { json, Request } from 'express';
import prisma from '@/prisma';
import { TOrder } from '@/models/order.model';
import { TCart } from '@/models/cart.model';
import crypto from 'crypto';

class OrderService {
  async getByUser(req: Request) {
    const { userId } = req.params;
    const order = await prisma.order.findMany({
      where: { userId: userId },
    });
    if (!order) throw new Error('Order empty');
    return order;
  }

  async getDetail(req: Request) {
    const { orderId } = req.params;
    const detail = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        OrderItem: {
          include: { product: true },
        },
      },
    });
    if (!detail) throw new Error('Order not found');
    return detail;
  }

  async updateStatus(req: Request) {
    const { orderId } = req.params;

    const update = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: 'processed',
      },
    });
  }

  async updateByMidtrans(req: Request) {
    try {
      const data = req.body;

      if (!data || typeof data !== 'object') {
        throw new Error(
          'Invalid request data. Missing or invalid data object.',
        );
      }

      // console.log('Received data:', data);

      const order = await prisma.order.findUnique({
        where: {
          invoice: data.order_id,
        },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      const hash = crypto
        .createHash('sha512')
        .update(
          `${data.order_id}${data.status_code}${data.gross_amount}${process.env.SERVER_KEY}`,
        )
        .digest('hex');

      if (data.signature_key !== hash) {
        throw new Error('Invalid signature key');
      }

      let responData = null;
      let orderStatus = data.transaction_status;
      let fraudStatus = data.fraud_status;

      if (orderStatus === 'capture' && fraudStatus === 'accept') {
        const updatedOrder = await prisma.order.update({
          where: { invoice: data.order_id },
          data: {
            status: 'processed',
            payment_method: data.payment_type,
            paidAt: new Date(data.transaction_time),
          },
        });
        responData = updatedOrder;
      } else if (orderStatus === 'settlement') {
        const updatedOrder = await prisma.order.update({
          where: { invoice: data.order_id },
          data: {
            status: 'processed',
            payment_method: data.payment_type,
            paidAt: new Date(data.transaction_time),
          },
        });
        responData = updatedOrder;
      } else if (
        orderStatus === 'cancel' ||
        orderStatus === 'deny' ||
        orderStatus === 'expire'
      ) {
        const updatedOrder = await prisma.order.update({
          where: { invoice: data.order_id },
          data: {
            status: 'cancelled',
          },
        });
        responData = updatedOrder;
      } else if (orderStatus === 'pending') {
        const updatedOrder = await prisma.order.update({
          where: { invoice: data.order_id },
          data: {
            status: 'waitingPayment',
          },
        });
        responData = updatedOrder;
      }

      // console.log('Response data:', responData);

      return responData;
    } catch (error) {
      console.error('Error in updateByMidtrans:', error);
      throw error;
    }
  }
}

export default new OrderService();
