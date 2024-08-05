import prisma from '@/prisma';
const midtransClient = require('midtrans-client');
const dayjs = require('dayjs');
const cron = require('node-cron');
import fs from 'fs';
import path from 'path';
import { transporter } from '@/lib/nodemailer';

const cancelUnpaidOrders = async () => {
  const oneHourAgo = dayjs().subtract(1, 'hour').toDate();
  const now = new Date();

  const manualOrders = await prisma.order.findMany({
    where: {
      createdAt: {
        lte: oneHourAgo,
      },
      status: 'waitingPayment',
      paidType: 'manual',
      paidAt: null,
    },
    include: {
      OrderItem: true,
    },
  });

  const gatewayOrders = await prisma.order.findMany({
    where: {
      createdAt: {
        lte: oneHourAgo,
      },
      status: 'waitingPayment',
      paidType: 'gateway',
      payment_method: null,
    },
    include: {
      OrderItem: true,
    },
  });

  const checkedManualOrders = await prisma.order.findMany({
    where: {
      checkedAt: {
        lte: oneHourAgo,
      },
      status: 'waitingPayment',
      paidType: 'manual',
      paidAt: {
        not: null,
      },
    },
    include: {
      OrderItem: true,
    },
  });

  const updatedGatewayOrders = await prisma.order.findMany({
    where: {
      expiry_time: {
        lte: now,
      },
      status: 'waitingPayment',
      paidType: 'gateway',
      payment_method: {
        not: null,
      },
      paidAt: null,
    },
    include: {
      OrderItem: true,
    },
  });

  const allOrders = [
    ...manualOrders,
    ...gatewayOrders,
    ...checkedManualOrders,
    ...updatedGatewayOrders,
  ];

  for (const order of allOrders) {
    if (order.paidType === 'gateway' && order.payment_method) {
      try {
        const coreApi = new midtransClient.CoreApi({
          isProduction: false,
          serverKey: process.env.SERVER_KEY,
          clientKey: process.env.CLIENT_KEY,
        });

        await coreApi.transaction.cancel(order.invoice);
        console.log(`cancellation request to midtrans for ${order.invoice}`);

        await prisma.order.update({
          where: { id: order.id },
          data: { cancelledBy: 'system' },
        });
      } catch (error) {
        console.error(
          `error while cancelling ${order.invoice} with midtrans:`,
          error,
        );
      }
    } else {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancelledBy: 'system',
        },
      });

      for (const item of order.OrderItem) {
        const updatedStock = await prisma.stock.update({
          where: {
            productId_storeId: {
              productId: item.productId,
              storeId: order.storeId,
            },
          },
          data: {
            quantity: { increment: item.quantity },
          },
        });

        await prisma.stockHistory.create({
          data: {
            stockId: updatedStock.id,
            quantityChange: item.quantity,
            reason: 'orderCancellation',
            changeType: 'in',
            productId: item.productId,
            storeId: order.storeId,
            orderId: order.id,
          },
        });
      }

      const templatePath = path.join(
        __dirname,
        '../../templates/cancelled.template.html',
      );
      const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

      const userData = await prisma.order.findFirst({
        where: { id: order.id },
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
          subject: 'Order Cancelled',
          html,
        });
      }
    }
  }

  console.log(`Cancelled ${allOrders.length} orders at ${new Date()}`);
};

cron.schedule('*/5 * * * *', async () => {
  console.log('running cron job to cancel unpaid orders');
  await cancelUnpaidOrders();
});

console.log('cron job has been scheduled');
