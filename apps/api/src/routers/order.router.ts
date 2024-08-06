import { OrderController } from '@/controllers/order.controller';
import { blobUploader } from '@/lib/multer';
import { validateToken } from '@/middleware/auth.middleware';
import { verifyAdmin, verifyUser } from '@/middleware/role.middleware';
import { Router } from 'express';

export class OrderRouter {
  private router: Router;
  private orderController: OrderController;

  constructor() {
    this.orderController = new OrderController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/midtrans', this.orderController.midtrans);
    this.router.post(
      '/',
      validateToken,
      verifyUser,
      this.orderController.createOrder,
    );
    this.router.get(
      '/all',
      validateToken,
      verifyAdmin,
      this.orderController.getAll,
    );
    this.router.get(
      '/yours',
      validateToken,
      verifyUser,
      this.orderController.getByUser,
    );
    this.router.get(
      '/a',
      validateToken,
      verifyUser,
      this.orderController.address,
    );
    this.router.get('/proof/:id', this.orderController.renderProof);
    this.router.get(
      '/admin/:orderId',
      validateToken,
      verifyAdmin,
      this.orderController.getDetailAdmin,
    );
    this.router.patch(
      '/cp/:orderId',
      validateToken,
      verifyAdmin,
      this.orderController.checkPayment,
    );
    this.router.patch(
      '/cu/:orderId',
      validateToken,
      verifyUser,
      this.orderController.cancelByUser,
    );
    this.router.patch(
      '/ca/:orderId',
      validateToken,
      verifyAdmin,
      this.orderController.cancelByAdmin,
    );
    this.router.patch(
      '/co/:orderId',
      validateToken,
      verifyUser,
      this.orderController.confirmation,
    );
    this.router.patch(
      '/s/:orderId',
      validateToken,
      verifyAdmin,
      this.orderController.shippedOrder,
    );
    this.router.patch(
      '/:orderId',
      validateToken,
      verifyUser,
      blobUploader().single('paymentProof'),
      this.orderController.uploadProof,
    );
    this.router.get(
      '/:invoice',
      validateToken,
      verifyUser,
      this.orderController.getDetail,
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
