import { OrderController } from '@/controllers/order.controller';
import { blobUploader } from '@/lib/multer';
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
    this.router.post('/:userId', this.orderController.createOrder);
    this.router.get('/all', this.orderController.getAll);
    this.router.get('/yours', this.orderController.getByUser);
    this.router.get('/a/:userId', this.orderController.address);
    this.router.get('/proof/:id', this.orderController.renderProof);
    this.router.get('/admin/:orderId', this.orderController.getDetailAdmin);
    this.router.patch('/cp/:orderId', this.orderController.checkPayment);
    this.router.patch('/cu/:orderId', this.orderController.cancelByUser);
    this.router.patch('/ca/:orderId', this.orderController.cancelByAdmin);
    this.router.patch('/co/:orderId', this.orderController.confirmation);
    this.router.patch('/s/:orderId', this.orderController.shippedOrder);
    this.router.patch(
      '/:orderId',
      blobUploader().single('paymentProof'),
      this.orderController.uploadProof,
    );
    this.router.get('/:invoice', this.orderController.getDetail);
  }

  getRouter(): Router {
    return this.router;
  }
}
