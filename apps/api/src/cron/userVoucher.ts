import prisma from '@/prisma';
import {
  CategoryVoucher,
  PrismaClient,
  Status,
  Voucher,
  User,
} from '@prisma/client';
const cron = require('node-cron');

const applyVouchers = async () => {
  try {
    const now = new Date();
    const vouchers = await prisma.voucher.findMany({
      where: {
        isValid: true,
        startDate: { lte: now },
        endDate: { gte: now },
        isDeleted: false,
      },
    });

    for (const voucher of vouchers) {
      if (voucher.category === CategoryVoucher.shippingCost) {
        await applyShippingCostVoucher(voucher);
      } else if (voucher.category === CategoryVoucher.totalPurchase) {
        await applyTotalPurchaseVoucher(voucher);
      }
    }
  } catch (error) {
    console.error('Error applying vouchers:', error);
  } finally {
    await prisma.$disconnect();
  }
};

const applyShippingCostVoucher = async (voucher: Voucher) => {
  try {
    if (voucher.minTransaction === null) {
      console.warn(`Voucher ${voucher.id} has no minimum transaction`);
      return;
    }

    const users = await prisma.user.findMany({
      where: {
        Order: {
          some: {
            storeId: voucher.storeId,
            createdAt: {
              gte: voucher.startDate,
              lte: voucher.endDate,
            },
            status: Status.confirmed,
          },
        },
      },
      include: {
        Order: {
          where: {
            storeId: voucher.storeId,
            createdAt: {
              gte: voucher.startDate,
              lte: voucher.endDate,
            },
            status: Status.confirmed,
          },
        },
      },
    });

    for (const user of users) {
      const confirmedOrders = user.Order.filter(
        (order) => order.status === Status.confirmed,
      );
      if (confirmedOrders.length >= voucher.minTransaction) {
        await createVoucherUser(voucher, user);
      }
    }
  } catch (error) {
    console.error(`Error applying shipping cost voucher: ${voucher.id}`, error);
  }
};

const applyTotalPurchaseVoucher = async (voucher: Voucher) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        Order: {
          some: {
            storeId: voucher.storeId,
            createdAt: {
              gte: voucher.startDate,
              lte: voucher.endDate,
            },
            status: Status.confirmed,
            totalPrice: { gte: voucher.minTotalPurchase ?? 0 },
          },
        },
      },
      include: {
        Order: {
          where: {
            storeId: voucher.storeId,
            createdAt: {
              gte: voucher.startDate,
              lte: voucher.endDate,
            },
            status: Status.confirmed,
            totalPrice: { gte: voucher.minTotalPurchase ?? 0 },
          },
        },
      },
    });

    for (const user of users) {
      const matchingOrders = user.Order.filter(
        (order) =>
          order.status === Status.confirmed &&
          order.totalPrice >= (voucher.minTotalPurchase ?? 0),
      );
      if (matchingOrders.length > 0) {
        await createVoucherUser(voucher, user);
      }
    }
  } catch (error) {
    console.error(
      `Error applying total purchase voucher: ${voucher.id}`,
      error,
    );
  }
};

const createVoucherUser = async (voucher: Voucher, user: User) => {
  try {
    const existingVoucherUser = await prisma.voucherUser.findFirst({
      where: {
        userId: user.id,
        voucherId: voucher.id,
      },
    });

    if (!existingVoucherUser) {
      await prisma.voucherUser.create({
        data: {
          userId: user.id,
          voucherId: voucher.id,
        },
      });
    } else {
      console.log(`User ${user.id} already has voucher ${voucher.id}`);
    }
  } catch (error) {
    console.error(
      `Error creating voucher user: ${voucher.id} for user: ${user.id}`,
      error,
    );
  }
};

// cron.schedule('*/5 * * * *', applyVouchers);
cron.schedule('*/5 * * * *', async () => {
  console.log('running cron job to apply user voucher');
  await applyVouchers();
});

console.log('cron job has been scheduled for user voucher');
