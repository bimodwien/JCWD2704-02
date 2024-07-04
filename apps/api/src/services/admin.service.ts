'use strict';
import prisma from '@/prisma';
import { Request } from 'express';
import { hashPassword } from '@/lib/bcrypt';
import { Prisma, Role } from '@prisma/client';

class AdminService {
  static async getAdmin() {
    const adminData = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    return adminData;
  }

  static async create(req: Request) {
    await prisma.$transaction(async (prisma) => {
      const email: string = req.body.email;
      const name: string = req.body.name;
      const password: string = req.body.password;
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
      };
      const newAdmin = await prisma.user.create({
        data,
      });
      return newAdmin;
    });
  }

  static async update(req: Request) {
    await prisma.$transaction(async (prisma) => {
      const id = req.params.id;
      const email: string = req.body.email;
      const name: string = req.body.name;
      const password: string = req.body.password;
      const user = await prisma.user.findUnique({
        where: { id },
      });
      if (!user) throw new Error('User not found');
      const hashed = await hashPassword(String(password));
      const data: Prisma.UserUpdateInput = {
        email,
        name,
        password: hashed,
      };
      const editedData = await prisma.user.update({
        data,
        where: { id },
      });
      return editedData;
    });
  }

  static async deleteUser(req: Request) {
    await prisma.$transaction(async (prisma) => {
      const id = req.params.id;
      await prisma.user.delete({
        where: { id },
      });
    });
  }
}
export default AdminService;
