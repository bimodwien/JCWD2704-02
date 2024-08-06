import { Router } from 'express';
import { VoucherController } from '@/controllers/voucher.controller';
import { validateToken } from '@/middleware/auth.middleware';
import { verifyAdmin } from '@/middleware/role.middleware';

export class VoucherRouter {
  private router: Router;
  private voucherController: VoucherController;

  constructor() {
    this.voucherController = new VoucherController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      '/',
      validateToken,
      verifyAdmin,
      this.voucherController.getByAll,
    );
    this.router.get(
      '/:id',
      validateToken,
      verifyAdmin,
      this.voucherController.getById,
    );
    this.router.post(
      '/',
      validateToken,
      verifyAdmin,
      this.voucherController.create,
    );
    this.router.delete(
      '/:id',
      validateToken,
      verifyAdmin,
      this.voucherController.deleteVoucher,
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
