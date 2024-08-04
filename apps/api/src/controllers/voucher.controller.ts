import VoucherService from '@/services/voucher.service';
import { Request, Response, NextFunction } from 'express';

export class VoucherController {
  async getByAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await VoucherService.getAll(req);
      res.status(200).send({
        message: 'Get all Voucher',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await VoucherService.getById(req);
      res.status(200).send({
        message: 'Get data voucher by ID',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await VoucherService.create(req);
      res.status(201).send({
        message: 'Create Voucher success',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
  async deleteVoucher(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await VoucherService.deleteVoucher(req);
      res.status(201).send({
        message: 'Delete voucher success',
      });
    } catch (error) {
      next(error);
    }
  }
}
