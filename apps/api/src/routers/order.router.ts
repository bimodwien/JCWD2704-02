import { OrderController } from '@/controllers/order.controller';
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
    this.router.get('/a/:userId', this.orderController.address);
    this.router.get('/:invoice', this.orderController.getDetail);
  }

  getRouter(): Router {
    return this.router;
  }
}
