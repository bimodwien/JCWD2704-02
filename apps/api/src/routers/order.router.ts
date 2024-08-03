import { OrderController } from '@/controllers/order.controller';
import { blobUploader } from '@/lib/multer';
import { validateToken } from '@/middleware/auth.middleware';
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
      '/:userId',
      validateToken,
      this.orderController.createOrder,
    );
    this.router.get('/all', validateToken, this.orderController.getAll);
    this.router.get('/yours', validateToken, this.orderController.getByUser);
    this.router.get('/a/:userId', this.orderController.address);
    this.router.get('/proof/:id', this.orderController.renderProof);
    this.router.get(
      '/admin/:orderId',
      validateToken,
      this.orderController.getDetailAdmin,
    );
    this.router.patch(
      '/cp/:orderId',
      validateToken,
      this.orderController.checkPayment,
    );
    this.router.patch(
      '/cu/:orderId',
      validateToken,
      this.orderController.cancelByUser,
    );
    this.router.patch(
      '/ca/:orderId',
      validateToken,
      this.orderController.cancelByAdmin,
    );
    this.router.patch(
      '/co/:orderId',
      validateToken,
      this.orderController.confirmation,
    );
    this.router.patch(
      '/s/:orderId',
      validateToken,
      this.orderController.shippedOrder,
    );
    this.router.patch(
      '/:orderId',
      validateToken,
      blobUploader().single('paymentProof'),
      this.orderController.uploadProof,
    );
    this.router.get('/:invoice', validateToken, this.orderController.getDetail);
  }

  getRouter(): Router {
    return this.router;
  }
}
