import { Router } from 'express';
import { StockController } from '@/controllers/stock.controller';
import { validateToken } from '@/middleware/auth.middleware';
import { verifyAdmin } from '@/middleware/role.middleware';

export class StockRouter {
  private router: Router;
  private stockController: StockController;

  constructor() {
    this.stockController = new StockController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      '/',
      validateToken,
      verifyAdmin,
      this.stockController.getAll,
    );
    this.router.post(
      '/',
      validateToken,
      verifyAdmin,
      this.stockController.create,
    );
    this.router.patch(
      '/:id',
      validateToken,
      verifyAdmin,
      this.stockController.update,
    );
    this.router.get(
      '/:id',
      validateToken,
      verifyAdmin,
      this.stockController.getById,
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
