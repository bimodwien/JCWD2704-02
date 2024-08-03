import { Request, Response, NextFunction } from 'express';
import stockHistoryService from '@/services/stock.history.service';

export class StockHistoryController {
  async getStockHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await stockHistoryService.getAll(req);
      res.status(200).send({
        message: 'Get All Stock History',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStockHistoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await stockHistoryService.getById(req);
      res.status(200).send({
        message: 'Get Stock History By Id',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
