'use strict';
import { Router } from 'express';
import { CategoryController } from '@/controllers/category.controllers';
import { blobUploader } from '@/lib/multer';
import { validateToken } from '@/middleware/auth.middleware';
import { verifyAdmin } from '@/middleware/role.middleware';

export class CategoryRouter {
  private router: Router;
  private categoryController: CategoryController;

  constructor() {
    this.categoryController = new CategoryController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      '/',
      validateToken,
      verifyAdmin,
      this.categoryController.getAll,
    );
    this.router.get('/all', this.categoryController.allData);
    this.router.get(
      '/:id',
      validateToken,
      verifyAdmin,
      this.categoryController.getById,
    );
    this.router.post(
      '/',
      validateToken,
      verifyAdmin,
      blobUploader().single('image'),
      this.categoryController.create,
    );
    this.router.patch(
      '/:id',
      validateToken,
      verifyAdmin,
      blobUploader().single('image'),
      this.categoryController.edit,
    );
    this.router.delete(
      '/:id',
      validateToken,
      verifyAdmin,
      this.categoryController.deleteCategory,
    );
    this.router.get('/images/:id', this.categoryController.render);
  }

  getRouter(): Router {
    return this.router;
  }
}
