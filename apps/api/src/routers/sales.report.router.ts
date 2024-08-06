import { Router } from 'express';
import { SalesReportController } from '@/controllers/sales.report.controller';
import { validateToken } from '@/middleware/auth.middleware';
import { verifyAdmin } from '@/middleware/role.middleware';

export class ReportRouter {
  private router: Router;
  private reportController: SalesReportController;

  constructor() {
    this.reportController = new SalesReportController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      '/monthly-report',
      validateToken,
      verifyAdmin,
      this.reportController.getMonthlySalesReport,
    );
    this.router.get(
      '/monthly-category-report',
      validateToken,
      verifyAdmin,
      this.reportController.getMonthlySalesByCategoryReport,
    );
    this.router.get(
      '/monthly-product-report',
      validateToken,
      verifyAdmin,
      this.reportController.getMonthlySalesByProductReport,
    );
  }
  getRouter(): Router {
    return this.router;
  }
}
