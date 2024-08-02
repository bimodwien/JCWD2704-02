import { Router } from 'express';
import { AdminController } from '@/controllers/admin.controllers';
import { validateRefreshToken } from '@/middleware/auth.middleware';

export class AdminRouter {
  private router: Router;
  private adminController: AdminController;

  constructor() {
    this.adminController = new AdminController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', this.adminController.getAll);
    this.router.post('/', this.adminController.createStoreAdmin);
    this.router.post('/login', this.adminController.login);
    this.router.get(
      '/validate',
      validateRefreshToken,
      this.adminController.validate,
    );
    this.router.get('/:id', this.adminController.getById);
    this.router.patch('/:id', this.adminController.editStoreAdmin);
    this.router.delete('/:id', this.adminController.deleteStoreAdmin);
  }

  getRouter(): Router {
    return this.router;
  }
}
