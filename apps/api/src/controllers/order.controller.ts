import createOrderService from '@/services/createOrder.service';
import orderSevice from '@/services/order.sevice';
import orderAdminService from '@/services/orderAdmin.service';
import { NextFunction, Request, Response } from 'express';

export class OrderController {
  async getDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await orderSevice.getDetail(req);
      res.status(201).send({
        message: 'order detail',
        data: data,
      });
    } catch (error) {
      next(error);
    }
  }

  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await createOrderService.createOrder(req);
      res.status(201).send({
        message: 'new order created',
        data: data,
      });
    } catch (error) {
      next(error);
    }
  }
  async address(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await createOrderService.shippingAddress(req);
      res.status(201).send({
        message: 'fetch user address',
        data: data,
      });
    } catch (error) {
      next(error);
    }
  }

  async midtrans(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('tesss');
      await orderSevice.updateByMidtrans(req);
      console.log('masuk');
      res.status(200).json({
        status: 'success',
        message: 'OK',
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadProof(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await orderSevice.paymentProof(req);
      res.status(201).send({
        message: 'file uploaded successfully',
        data: data,
      });
    } catch (error) {
      next(error);
    }
  }

  async renderProof(req: Request, res: Response, next: NextFunction) {
    try {
      const blob = await orderSevice.renderProof(req);
      res.set('Content-type', 'image/png');
      res.send(blob);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await orderAdminService.getAll(req);
      res.status(201).send({
        message: 'fetch order',
        data: data,
      });
    } catch (error) {
      next(error);
    }
  }
}
