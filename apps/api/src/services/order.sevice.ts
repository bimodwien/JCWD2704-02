import { Request } from 'express';
import prisma from '@/prisma';
import crypto from 'crypto';
import sharp from 'sharp';

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
    const { invoice } = req.params;
    const detail = await prisma.order.findUnique({
      where: { invoice: invoice },
      include: {
        OrderItem: {
          include: {
            product: { include: { ProductImage: { select: { id: true } } } },
          },
        },
        address: true,
      },
    });
    if (!detail) throw new Error('Order not found');
    return detail;
  }

  async paymentProof(req: Request) {
    const { orderId } = req.params;
    const { file } = req;
    const userId = 'clz5p3y8f0000ldvnbx966ss6';

    const order = await prisma.order.findUnique({
      where: { id: orderId, paidType: 'manual' },
    });
    if (!order) throw new Error('order not found');

    let status = order.status;
    let paid_at = order.paidAt;

    if (file) {
      status = 'waitingConfirmation';
      paid_at = new Date();
      const buffer = await sharp(file.buffer).png().toBuffer();

      return await prisma.order.update({
        where: { id: orderId, userId: userId },
        data: { paymentProof: buffer, status, paidAt: paid_at },
      });
    }
  }

  async renderProof(req: Request) {
    const data = await prisma.order.findUnique({
      where: {
        id: req.params.id,
      },
    });
    return data?.paymentProof;
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
            processedAt: new Date(data.transaction_time),
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
            processedAt: new Date(data.transaction_time),
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
            payment_method: data.payment_type,
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
