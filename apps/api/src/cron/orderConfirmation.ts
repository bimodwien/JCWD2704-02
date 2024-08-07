import { transporter } from '@/lib/nodemailer';
import prisma from '@/prisma';
const dayjs = require('dayjs');
const cron = require('node-cron');
import fs from 'fs';
import path from 'path';

const sendConfirmationEmail = async (orderId: string) => {
  const templatePath = path.join(
    __dirname,
    '../templates/confirmed.template.html',
  );
  const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

  const userData = await prisma.order.findFirst({
    where: { id: orderId },
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
      subject: 'Order Confirmed',
      html,
    });
  }
};

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
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'confirmed',
        confirmedAt: new Date(),
        confirmedBy: 'system',
      },
    });

    console.log(`Order ${updatedOrder.id} has been confirmed by system`);

    await sendConfirmationEmail(updatedOrder.id);
  }

  console.log(`Confirmed ${shippedOrders.length} orders at ${new Date()}`);
};

cron.schedule('0 0 * * *', async () => {
  console.log('Running cron job to confirm shipped orders older than 7 days');
  await confirmShippedOrders();
});

console.log('Cron job for confirming shipped orders has been scheduled');
