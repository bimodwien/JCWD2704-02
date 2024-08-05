import prisma from '@/prisma';
const dayjs = require('dayjs');
const cron = require('node-cron');

const confirmShippedOrders = async () => {
  const sevenDaysAgo = dayjs().subtract(7, 'days').toDate();

  const shippedOrders = await prisma.order.findMany({
    where: {
      shippedAt: {
        lte: sevenDaysAgo,
      },
      status: 'shipped',
    },
  });

  for (const order of shippedOrders) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'confirmed',
        confirmedAt: new Date(),
        confirmedBy: 'system',
      },
    });

    console.log(`Order ${order.id} has been confirmed by system`);
  }

  console.log(`Confirmed ${shippedOrders.length} orders at ${new Date()}`);
};

cron.schedule('0 0 * * *', async () => {
  console.log('Running cron job to confirm shipped orders older than 7 days');
  await confirmShippedOrders();
});

console.log('Cron job for confirming shipped orders has been scheduled');
