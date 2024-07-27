'use strict';
import StockService from '@/services/stock.service';
import { Request, Response, NextFunction } from 'express';

export class StockController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await StockService.getAll(req);
      res.status(200).send({
        message: 'Get All Stock',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await StockService.getById(req);
      res.status(200).send({
        message: 'Get stock by Id',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await StockService.create(req);
      res.status(201).send({
        message: 'Create Stock Success',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await StockService.update(req);
      res.status(201).send({
        message: 'Edit Stock Success',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
