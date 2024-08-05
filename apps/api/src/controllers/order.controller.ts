import createOrderService from '@/services/createOrder.service';
import midtransService from '@/services/midtrans.service';
import orderSevice from '@/services/order.sevice';
import orderDataService from '@/services/orderData.service';
import orderUpdateService from '@/services/orderUpdate.service';
import { NextFunction, Request, Response } from 'express';

export class OrderController {
  async getDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await orderDataService.getDetail(req);
      res.status(201).send({
        message: 'order detail',
        data: data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDetailAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await orderDataService.detailAdmin(req);
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
      await midtransService.updateByMidtrans(req);
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
      const data = await orderDataService.getAll(req);
      res.status(201).send({
        message: 'fetch order',
        data: data,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const cancel = await orderSevice.cancelByUser(req);
      res.status(201).send({
        message: 'cancel order',
        data: cancel,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelByAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const cancel = await orderUpdateService.adminCancel(req);
      res.status(201).send({
        message: 'send user order',
        data: cancel,
      });
    } catch (error) {
      next(error);
    }
  }

  async checkPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const check = await orderUpdateService.checkPayment(req);
      res.status(201).send({
        message: 'check order payment proof',
        data: check,
      });
    } catch (error) {
      next(error);
    }
  }

  async shippedOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const shipped = await orderUpdateService.shipped(req);
      res.status(201).send({
        message: 'order shipped by admin',
        data: shipped,
      });
    } catch (error) {
      next(error);
    }
  }

  async confirmation(req: Request, res: Response, next: NextFunction) {
    try {
      const confirmed = await orderSevice.confirmOrder(req);
      res.status(201).send({
        message: 'order confirmed by user',
        data: confirmed,
      });
    } catch (error) {
      next(error);
    }
  }

  async getByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await orderDataService.getByUser(req);
      res.status(201).send({
        message: 'fetch order',
        data: data,
      });
    } catch (error) {
      next(error);
    }
  }
}
