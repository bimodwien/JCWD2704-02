import { Router } from 'express';
import { StockHistoryController } from '@/controllers/stock.history';
import { validateToken } from '@/middleware/auth.middleware';
import { verifyAdmin } from '@/middleware/role.middleware';

export class StockHistoryRouter {
  private router: Router;
  private stockController: StockHistoryController;

  constructor() {
    this.stockController = new StockHistoryController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      '/',
      validateToken,
      verifyAdmin,
      this.stockController.getStockHistory,
    );
    this.router.get(
      '/:id',
      validateToken,
      verifyAdmin,
      this.stockController.getStockHistoryById,
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
