'use strict';
import CategoryService from '@/services/category.service';
import { Request, Response, NextFunction } from 'express';

export class CategoryController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CategoryService.getAll(req);
      res.status(200).send({
        message: 'All Category',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CategoryService.getById(req);
      res.status(200).send({
        message: 'Category by Id',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      await CategoryService.create(req);
      res.status(201).send({
        message: 'Create new category success',
      });
    } catch (error) {
      next(error);
    }
  }

  async edit(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CategoryService.edit(req);
      res.status(201).send({
        message: 'Edit category success',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      await CategoryService.deleteCategory(req);
      res.status(201).send({
        message: 'Delete category success',
      });
    } catch (error) {
      next(error);
    }
  }

  async render(req: Request, res: Response, next: NextFunction) {
    try {
      const blob = await CategoryService.render(req);
      res.set('Content-type', 'image/png');
      res.send(blob);
    } catch (error) {
      next(error);
    }
  }

  async allData(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CategoryService.allData();
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}
