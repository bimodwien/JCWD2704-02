// import { PrismaClient, VoucherCategory, OrderStatus } from '@prisma/client';
// import cron from 'node-cron';

// const prisma = new PrismaClient();

// async function applyVouchers() {
//   try {
//     // Get all ongoing vouchers
//     const now = new Date();
//     const vouchers = await prisma.voucher.findMany({
//       where: {
//         isValid: true,
//         startDate: { lte: now },
//         endDate: { gte: now },
//         isDeleted: false,
//       },
//     });

//     for (const voucher of vouchers) {
//       if (voucher.category === VoucherCategory.SHIPPING_COST) {
//         await applyShippingCostVoucher(voucher);
//       } else if (voucher.category === VoucherCategory.TOTAL_PURCHASE) {
//         await applyTotalPurchaseVoucher(voucher);
//       }
//     }
//   } catch (error) {
//     console.error('Error applying vouchers:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// async function applyShippingCostVoucher(voucher: any) {
//   const users = await prisma.user.findMany({
//     where: {
//       orders: {
//         some: {
//           storeId: voucher.storeId,
//           createdAt: {
//             gte: voucher.startDate,
//             lte: voucher.endDate,
//           },
//           status: OrderStatus.CONFIRMED,
//         },
//       },
//     },
//     include: {
//       orders: true,
//     },
//   });

//   for (const user of users) {
//     const confirmedOrders = user.orders.filter(
//       (order) => order.status === OrderStatus.CONFIRMED,
//     );
//     if (confirmedOrders.length >= voucher.minTransaction) {
//       await createVoucherUser(voucher, user);
//     }
//   }
// }

// async function applyTotalPurchaseVoucher(voucher: any) {
//   const users = await prisma.user.findMany({
//     where: {
//       orders: {
//         some: {
//           storeId: voucher.storeId,
//           createdAt: {
//             gte: voucher.startDate,
//             lte: voucher.endDate,
//           },
//           status: OrderStatus.CONFIRMED,
//           totalPrice: { gte: voucher.minTotalPurchase },
//         },
//       },
//     },
//     include: {
//       orders: true,
//     },
//   });

//   for (const user of users) {
//     const matchingOrders = user.orders.filter(
//       (order) =>
//         order.status === OrderStatus.CONFIRMED &&
//         order.totalPrice >= voucher.minTotalPurchase,
//     );
//     if (matchingOrders.length > 0) {
//       await createVoucherUser(voucher, user);
//     }
//   }
// }

// async function createVoucherUser(voucher: any, user: any) {
//   const existingVoucherUser = await prisma.voucherUser.findFirst({
//     where: {
//       userId: user.id,
//       voucherId: voucher.id,
//     },
//   });

//   if (!existingVoucherUser) {
//     await prisma.voucherUser.create({
//       data: {
//         userId: user.id,
//         voucherId: voucher.id,
//       },
//     });
//   }
// }

// cron.schedule('0 0 * * *', applyVouchers);

// console.log('Voucher cron job scheduled to run every day at midnight.');
