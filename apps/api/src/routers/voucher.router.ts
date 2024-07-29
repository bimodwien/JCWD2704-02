import { Router } from 'express';
import { VoucherController } from '@/controllers/voucher.controller';

export class VoucherRouter {
  private router: Router;
  private voucherController: VoucherController;

  constructor() {
    this.voucherController = new VoucherController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', this.voucherController.getByAll);
    this.router.get('/:id', this.voucherController.getById);
    this.router.post('/', this.voucherController.create);
    this.router.delete('/:id', this.voucherController.deleteVoucher);
  }

  getRouter(): Router {
    return this.router;
  }
}
