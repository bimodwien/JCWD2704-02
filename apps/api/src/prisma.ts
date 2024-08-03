import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });

export default new PrismaClient({ log: ['error'] });
