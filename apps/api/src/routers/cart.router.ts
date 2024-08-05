import { CartController } from '@/controllers/cart.controller';
import { validateToken } from '@/middleware/auth.middleware';
import { Router } from 'express';

export class CartRouter {
  private router: Router;
  private cartController: CartController;

  constructor() {
    this.cartController = new CartController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/a', validateToken, this.cartController.getByUser);
    this.router.get('/t/:userId', validateToken, this.cartController.sumCart);
    this.router.post('/c', validateToken, this.cartController.addCart);
    this.router.patch(
      '/:cartId',
      validateToken,
      this.cartController.updateCart,
    );
    this.router.delete(
      '/:cartId',
      validateToken,
      this.cartController.deleteCart,
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
