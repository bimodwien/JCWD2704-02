'use strict';
import prisma from '@/prisma';
import { Request } from 'express';
import { hashPassword } from '@/lib/bcrypt';
import { $Enums, Prisma, Role } from '@prisma/client';

class AdminService {
  static async getAll(req: Request) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const name = String(req.query.name || '');

    const adminData = await prisma.user.findMany({
      where: { name: { contains: name }, role: $Enums.Role.storeAdmin },
      skip: skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        store: {
          select: {
            name: true,
          },
        },
      },
    });

    const total = await prisma.user.count();
    return {
      data: adminData,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getById(req: Request) {
    const id = req.params.id;
    const data = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        store: {
          select: {
            name: true,
          },
        },
      },
    });
    return data;
  }

  static async create(req: Request) {
    await prisma.$transaction(async (prisma: any) => {
      const email: string = req.body.email;
      const name: string = req.body.name;
      const password: string = req.body.password;
      const storeId: string = req.body.storeId;

      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ name }, { email }] },
      });
      if (existingUser) throw new Error('this store admin has been used');
      const hashed = await hashPassword(String(password));
      const role = Role.storeAdmin;

      const data: Prisma.UserCreateInput = {
        email,
        name,
        password: hashed,
        role,
        isVerified: true,
        store: {
          connect: {
            id: storeId,
          },
        },
      };

      await prisma.store.update({
        where: { id: storeId },
        data: { isChosen: true },
      });

      const newAdmin = await prisma.user.create({
        data,
      });
      return newAdmin;
    });
  }

  static async update(req: Request) {
    const id = req.params.id;
    const { email, name, password, storeId: newStoreId } = req.body;

    const updatedUser = await prisma.$transaction(async (prisma: any) => {
      const user = await prisma.user.findUnique({
        where: { id },
        include: { store: true },
      });

      if (!user) throw { message: 'User not found' };

      console.log('Current User:', user);

      const hashedPassword = await hashPassword(String(password));

      const updatedUser = await prisma.user.update({
        data: {
          email,
          name,
          password: hashedPassword,
        },
        where: { id },
      });

      console.log('Updated User:', updatedUser);

      if (user.store && user.store.length > 0) {
        console.log('Updating old store to isChosen: false', user.store[0].id);
        await prisma.store.update({
          where: { id: user.store[0].id },
          data: { isChosen: false, userId: 'superAdmin' },
        });
      }

      if (newStoreId) {
        console.log('Updating new store to isChosen: true', newStoreId);
        await prisma.store.update({
          where: { id: newStoreId },
          data: { isChosen: true, userId: id },
        });
      }

      return updatedUser;
    });

    return updatedUser;
  }

  static async deleteUser(req: Request): Promise<void> {
    const id = req.params.id;

    await prisma.$transaction(async (prisma: any) => {
      const user = await prisma.user.findUnique({
        where: { id },
        include: { store: true }, // Sertakan store untuk mendapatkan informasi toko
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.store && user.store.length > 0) {
        await prisma.store.update({
          where: { id: user.store[0].id },
          data: { isChosen: false, userId: 'superAdmin' },
        });
      }

      await prisma.user.delete({
        where: { id },
      });
    });
  }
}
export default AdminService;
