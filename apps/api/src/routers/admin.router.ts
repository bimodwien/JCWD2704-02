import { Router } from 'express';
import { AdminController } from '@/controllers/admin.controllers';
import {
  validateToken,
  validateRefreshToken,
} from '@/middleware/auth.middleware';
import { verifyAdmin, verifySuperAdmin } from '@/middleware/role.middleware';

export class AdminRouter {
  private router: Router;
  private adminController: AdminController;

  constructor() {
    this.adminController = new AdminController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      '/',
      validateToken,
      verifyAdmin,
      this.adminController.getAll,
    );
    this.router.post(
      '/',
      validateToken,
      verifySuperAdmin,
      this.adminController.createStoreAdmin,
    );
    this.router.post('/login', this.adminController.login);
    this.router.get(
      '/validate',
      validateRefreshToken,
      this.adminController.validate,
    );
    this.router.get(
      '/:id',
      validateToken,
      verifyAdmin,
      this.adminController.getById,
    );
    this.router.patch(
      '/:id',
      validateToken,
      verifySuperAdmin,
      this.adminController.editStoreAdmin,
    );
    this.router.delete(
      '/:id',
      validateToken,
      verifySuperAdmin,
      this.adminController.deleteStoreAdmin,
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
