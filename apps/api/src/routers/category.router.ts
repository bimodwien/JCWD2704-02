'use strict';
import { Router } from 'express';
import { CategoryController } from '@/controllers/category.controllers';
import { blobUploader } from '@/lib/multer';

export class CategoryRouter {
  private router: Router;
  private categoryController: CategoryController;

  constructor() {
    this.categoryController = new CategoryController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', this.categoryController.getAll);
    this.router.get('/:id', this.categoryController.getById);
    this.router.post(
      '/',
      blobUploader().single('image'),
      this.categoryController.create,
    );
    this.router.patch(
      '/:id',
      blobUploader().single('image'),
      this.categoryController.edit,
    );
    this.router.delete('/:id', this.categoryController.deleteCategory);
    this.router.get('/images/:id', this.categoryController.render);
  }

  getRouter(): Router {
    return this.router;
  }
}
