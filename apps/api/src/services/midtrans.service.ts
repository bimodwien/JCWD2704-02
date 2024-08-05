import prisma from '@/prisma';
import { Request } from 'express';
import crypto from 'crypto';
import { transporter } from '@/lib/nodemailer';
const midtransClient = require('midtrans-client');
import fs from 'fs';
import path from 'path';

class MidtransService {
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

        const templatePath = path.join(
          __dirname,
          '../../templates/processed.template.html',
        );
        const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

        const userData = await prisma.order.findFirst({
          where: { invoice: data.order_id },
          select: {
            invoice: true,
            user: { select: { name: true, email: true } },
          },
        });

        if (userData) {
          const userEmail = userData.user.email;
          const userName = userData.user.name || userData.user.email;
          const orderInvoice = userData.invoice;
          const html = htmlTemplate
            .replace(/{orderNumber}/g, orderInvoice)
            .replace(/{customerName}/g, userName);

          await transporter.sendMail({
            from: 'bbhstore01@gmail.com',
            to: userEmail,
            subject: 'Payment Approve',
            html,
          });
        }
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

        const templatePath = path.join(
          __dirname,
          '../../templates/processed.template.html',
        );
        const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

        const userData = await prisma.order.findFirst({
          where: { invoice: data.order_id },
          select: {
            invoice: true,
            user: { select: { name: true, email: true } },
          },
        });

        if (userData) {
          const userEmail = userData.user.email;
          const userName = userData.user.name || userData.user.email;
          const orderInvoice = userData.invoice;
          const html = htmlTemplate
            .replace(/{orderNumber}/g, orderInvoice)
            .replace(/{customerName}/g, userName);

          await transporter.sendMail({
            from: 'bbhstore01@gmail.com',
            to: userEmail,
            subject: 'Payment Approve',
            html,
          });
        }
        responData = updatedOrder;
      } else if (
        orderStatus === 'cancel' ||
        orderStatus === 'deny' ||
        orderStatus === 'expire'
      ) {
        try {
          const updatedOrder = await prisma.$transaction(async (prisma) => {
            const orderUpdate = await prisma.order.update({
              where: { invoice: data.order_id },
              data: { status: 'cancelled', cancelledAt: new Date() },
            });

            const orderItems = await prisma.orderItem.findMany({
              where: { orderId: orderUpdate.id },
            });

            for (const item of orderItems) {
              const updatedStock = await prisma.stock.update({
                where: {
                  productId_storeId: {
                    productId: item.productId,
                    storeId: orderUpdate.storeId,
                  },
                },
                data: {
                  quantity: { increment: item.quantity },
                },
              });

              if (updatedStock) {
                await prisma.stockHistory.create({
                  data: {
                    quantityChange: item.quantity,
                    reason: 'orderCancellation',
                    changeType: 'in',
                    productId: item.productId,
                    stockId: updatedStock.id,
                    storeId: orderUpdate.storeId,
                    orderId: orderUpdate.id,
                  },
                });
              } else {
                throw new Error(
                  `stock not found for product ${item.productId} and store ${orderUpdate.storeId}`,
                );
              }
            }

            return orderUpdate;
          });

          responData = updatedOrder;
        } catch (error) {
          console.error('error cancellation:', error);
          throw new Error('failed to cancel order and update stock');
        }
      } else if (orderStatus === 'pending') {
        const updatedOrder = await prisma.order.update({
          where: { invoice: data.order_id },
          data: {
            status: 'waitingPayment',
            payment_method: data.payment_type,
            expiry_time: new Date(data.expiry_time),
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
export default new MidtransService();
