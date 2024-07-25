import { CartController } from '@/controllers/cart.controller';
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
    this.router.get('/:userId', this.cartController.getByUser);
    this.router.get('/t/:userId', this.cartController.sumCart);
    this.router.post('/c', this.cartController.addCart);
    this.router.patch('/:cartId', this.cartController.updateCart);
    this.router.delete('/:cartId', this.cartController.deleteCart);
  }

  getRouter(): Router {
    return this.router;
  }
}
