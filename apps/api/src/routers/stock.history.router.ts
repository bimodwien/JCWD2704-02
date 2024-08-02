import { Router } from 'express';
import { StockHistoryController } from '@/controllers/stock.history';

export class StockHistoryRouter {
  private router: Router;
  private stockController: StockHistoryController;

  constructor() {
    this.stockController = new StockHistoryController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', this.stockController.getStockHistory);
    this.router.get('/:id', this.stockController.getStockHistoryById);
  }

  getRouter(): Router {
    return this.router;
  }
}
