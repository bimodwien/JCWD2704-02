import prisma from '@/prisma';
import cron from 'node-cron';

const updateVoucherUsage = async () => {
  const now = new Date();

  const cancelledOrdersWithVoucher = await prisma.order.findMany({
    where: {
      status: 'cancelled',
      cancelledAt: {
        not: null,
      },
      voucherId: {
        not: null,
      },
    },
    select: {
      voucherId: true,
    },
  });

  const voucherIds = [
    ...new Set(
      cancelledOrdersWithVoucher
        .map((order) => order.voucherId)
        .filter((id): id is string => id !== null),
    ),
  ];

  if (voucherIds.length > 0) {
    await prisma.voucherUser.updateMany({
      where: {
        voucherId: { in: voucherIds },
        isUsed: true,
      },
      data: { isUsed: false },
    });

    console.log(
      `Updated voucher usage for ${voucherIds.length} vouchers at ${now}`,
    );
  } else {
    console.log('No vouchers to update.');
  }
};

cron.schedule('0 * * * *', async () => {
  console.log('Running cron job to update voucher usage for cancelled orders');
  await updateVoucherUsage();
});

console.log('Voucher usage update cron job has been scheduled');
