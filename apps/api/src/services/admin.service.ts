'use strict';
import prisma from '@/prisma';
import { Request } from 'express';
import { comparePassword, hashPassword } from '@/lib/bcrypt';
import { $Enums, Prisma, Role } from '@prisma/client';
import { TUser } from '@/models/admin.model';
import { createToken } from '@/lib/jwt';

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

  static async login(req: Request) {
    const role = req.body.role;

    const access_token = createToken({ user: { role }, type: 'access_token' });

    return { access_token };
  }

  static async validate(req: Request) {
    const user = {
      role: req.user?.role,
    };
    return createToken({ user, type: 'access_token' });
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
