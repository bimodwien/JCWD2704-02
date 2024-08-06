import { CartController } from '@/controllers/cart.controller';
import { validateToken } from '@/middleware/auth.middleware';
import { verifyAdmin, verifyUser } from '@/middleware/role.middleware';
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
    this.router.get(
      '/a',
      validateToken,
      verifyUser,
      this.cartController.getByUser,
    );
    this.router.get(
      '/voucher',
      validateToken,
      verifyUser,
      this.cartController.getVoucherUser,
    );
    this.router.get('/store', validateToken, this.cartController.getStore);
    this.router.get('/stock', validateToken, this.cartController.getStock);
    this.router.patch(
      '/s',
      validateToken,
      verifyUser,
      this.cartController.updateStore,
    );
    this.router.get(
      '/t',
      validateToken,
      verifyUser,
      this.cartController.sumCart,
    );
    this.router.post(
      '/c',
      validateToken,
      verifyUser,
      this.cartController.addCart,
    );
    this.router.patch(
      '/:cartId',
      validateToken,
      verifyUser,
      this.cartController.updateCart,
    );
    this.router.delete(
      '/:cartId',
      validateToken,
      verifyUser,
      this.cartController.deleteCart,
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
