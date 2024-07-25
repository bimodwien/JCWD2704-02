import { StoreController } from '@/controllers/store.controller';
import { Router } from 'express';

export class StoreRouter {
  private router: Router;
  private storeController: StoreController;

  constructor() {
    this.storeController = new StoreController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/create', this.storeController.createStore);
    this.router.get('/', this.storeController.getStoresAll);
  }

  getRouter(): Router {
    return this.router;
  }
}
