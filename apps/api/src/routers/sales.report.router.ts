import { Router } from 'express';
import { SalesReportController } from '@/controllers/sales.report.controller';

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
      this.reportController.getMonthlySalesReport,
    );
    this.router.get(
      '/monthly-category-report',
      this.reportController.getMonthlySalesByCategoryReport,
    );
    this.router.get(
      '/monthly-product-report',
      this.reportController.getMonthlySalesByProductReport,
    );
  }
  getRouter(): Router {
    return this.router;
  }
}
