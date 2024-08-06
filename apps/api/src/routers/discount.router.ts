import { Router } from 'express';
import { DiscountController } from '@/controllers/discount.controller';
import { validateToken } from '@/middleware/auth.middleware';
import { verifyAdmin } from '@/middleware/role.middleware';

export class DiscountRouter {
  private router: Router;
  private discountController: DiscountController;

  constructor() {
    this.discountController = new DiscountController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      '/',
      validateToken,
      verifyAdmin,
      this.discountController.getByAll,
    );
    this.router.post(
      '/',
      validateToken,
      verifyAdmin,
      this.discountController.create,
    );
    this.router.get(
      '/:id',
      validateToken,
      verifyAdmin,
      this.discountController.getById,
    );
    this.router.patch(
      '/:id',
      validateToken,
      verifyAdmin,
      this.discountController.update,
    );
    this.router.delete(
      '/:id',
      validateToken,
      verifyAdmin,
      this.discountController.deleteDiscount,
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
