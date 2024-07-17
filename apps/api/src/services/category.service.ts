'use strict';
import prisma from '@/prisma';
import { Prisma } from '@prisma/client';
import { Request } from 'express';
import sharp from 'sharp';

class CategoryService {
  static async getAll(req: Request) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const name = String(req.query.name || '');

    const categoryData = await prisma.category.findMany({
      where: { name: { contains: name }, isDeleted: false },
      skip: skip,
      take: limit,
      select: {
        id: true,
        name: true,
        Product: { select: { id: true, name: true } },
      },
    });
    const total = await prisma.category.count();
    return {
      data: categoryData,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getById(req: Request) {
    const id = req.params.id;
    const data = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        isDeleted: true,
        image: true,
        Product: { select: { id: true, name: true } },
      },
    });
    return data;
  }

  static async create(req: Request) {
    await prisma.$transaction(async (prisma) => {
      const name: string = req.body.name;
      const { file } = req;
      const existingCategory = await prisma.category.findFirst({
        where: { name },
      });
      if (existingCategory) throw new Error('This category has exist before');
      const buffer = await sharp(req.file?.buffer).png().toBuffer();
      if (!file) throw new Error('no image uploaded');

      const data: Prisma.CategoryCreateInput = {
        name,
        image: buffer,
      };
      const newCategory = await prisma.category.create({ data });
      return newCategory;
    });
  }

  static async edit(req: Request) {
    await prisma.$transaction(async (prisma) => {
      const id = req.params.id;
      const name: string = req.body.name;
      const file = req.file;
      const category = await prisma.category.findUnique({ where: { id } });
      if (!category) throw new Error('Category not found');
      const data: Prisma.CategoryUpdateInput = {};
      if (name) data.name = name;
      if (file) {
        const buffer = await sharp(file?.buffer).png().toBuffer();
        data.image = buffer;
      }
      const editedCategory = await prisma.category.update({
        data,
        where: { id },
      });
      return editedCategory;
    });
  }

  static async deleteCategory(req: Request) {
    await prisma.$transaction(async (prisma) => {
      const id = req.params.id;
      await prisma.category.update({
        where: { id },
        data: { isDeleted: true },
      });
    });
  }

  static async render(req: Request) {
    const data = await prisma.category.findUnique({
      where: { id: req.params.id },
    });
    return data?.image;
  }
}

export default CategoryService;
