import { Router } from 'express';
import { StockController } from '@/controllers/stock.controller';

export class StockRouter {
  private router: Router;
  private stockController: StockController;

  constructor() {
    this.stockController = new StockController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', this.stockController.getAll);
    this.router.post('/', this.stockController.create);
    this.router.patch('/:id', this.stockController.update);
    this.router.get('/:id', this.stockController.getById);
  }

  getRouter(): Router {
    return this.router;
  }
}
