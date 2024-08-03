'use strict';
import ReportService from '@/services/sales.report.service';
import { Request, Response, NextFunction } from 'express';

export class SalesReportController {
  async getMonthlySalesReport(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ReportService.getMonthlySalesReport(req);
      res.status(200).send({
        message: 'report by sales per month',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMonthlySalesByCategoryReport(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const data = await ReportService.getMonthlySalesByCategoryReport(req);
      res.status(200).send({
        message: 'report sales per month by category',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMonthlySalesByProductReport(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const data = await ReportService.getMonthlySalesByProductReport(req);
      res.status(200).send({
        message: 'reprot sales per month by product',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
