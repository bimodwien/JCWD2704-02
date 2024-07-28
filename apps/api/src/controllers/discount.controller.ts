import DiscountService from '@/services/discount.service';
import { Request, Response, NextFunction } from 'express';

export class DiscountController {
  async getByAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DiscountService.getAll(req);
      res.status(200).send({
        message: 'Get all discount',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DiscountService.getById(req);
      res.status(200).send({
        message: 'Get all discount by ID',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DiscountService.create(req);
      res.status(201).send({
        message: 'Discount create success',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DiscountService.update(req);
      res.status(201).send({
        message: 'Discount update success',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteDiscount(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DiscountService.deleteDiscount(req);
      res.status(201).send({
        message: 'Discount delete success',
      });
    } catch (error) {
      next(error);
    }
  }
}
