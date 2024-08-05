import { NextFunction, Request, Response } from 'express';
import cartService from '@/services/cart.service';
import cartDataService from '@/services/cartData.service';

export class CartController {
  async getByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await cartDataService.getByUser(req);
      return res.send({
        message: 'your cart',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async sumCart(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await cartDataService.sumCart(req);
      return res.send({
        message: 'your cart total',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async addCart(req: Request, res: Response, next: NextFunction) {
    try {
      await cartService.addCart(req);
      res.status(201).send({
        message: 'new cart added',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCart(req: Request, res: Response, next: NextFunction) {
    try {
      await cartDataService.updateCart(req);
      return res.send({
        message: 'cart has been updated',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCart(req: Request, res: Response, next: NextFunction) {
    try {
      await cartDataService.delete(req);
      return res.send({
        message: 'cart has been deleted',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStore(req: Request, res: Response, next: NextFunction) {
    try {
      await cartService.updateAddress(req);
      return res.send({
        message: 'cart store has been updated',
      });
    } catch (error) {
      next(error);
    }
  }

  async getStore(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await cartDataService.getStore(req);
      return res.send({
        message: 'all store',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStock(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await cartDataService.getStock(req);
      return res.send({
        message: 'all stock',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getVoucherUser(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await cartDataService.getVoucher(req);
      return res.send({
        message: 'all user voucher',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
