import prisma from '@/prisma';
const midtransClient = require('midtrans-client');
const dayjs = require('dayjs');
const cron = require('node-cron');

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
    }
  }

  console.log(`Cancelled ${allOrders.length} orders at ${new Date()}`);
};

cron.schedule('*/5 * * * *', async () => {
  console.log('running cron job to cancel unpaid orders');
  await cancelUnpaidOrders();
});

console.log('cron job has been scheduled');
