import { Router } from 'express';
import { DiscountController } from '@/controllers/discount.controller';

export class DiscountRouter {
  private router: Router;
  private discountController: DiscountController;

  constructor() {
    this.discountController = new DiscountController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', this.discountController.getByAll);
    this.router.post('/', this.discountController.create);
    this.router.get('/:id', this.discountController.getById);
    this.router.patch('/:id', this.discountController.update);
    this.router.delete('/:id', this.discountController.deleteDiscount);
  }

  getRouter(): Router {
    return this.router;
  }
}
