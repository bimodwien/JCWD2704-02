import ProductService2 from '@/services/product-2.service';
import ProductService from '@/services/product.service';

import { Request, Response, NextFunction } from 'express';

export class ProductController {
  async getByAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProductService.getByAll(req);
      res.status(200).send({
        message: 'Get Product by pages',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProductService.getDetail(req);
      res.status(200).send({
        message: 'Get Product detail',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProductService.create(req);
      res.status(201).send({
        message: 'Product create success',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async editProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProductService.edit(req);
      res.status(201).send({
        message: 'Product edit success',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProductService.deleteProduct(req);
      res.status(201).send({
        message: 'Product delete success',
      });
    } catch (error) {
      next(error);
    }
  }

  async render(req: Request, res: Response, next: NextFunction) {
    try {
      const blob = await ProductService.render(req);
      res.set('Content-type', 'image/png');
      res.send(blob);
    } catch (error) {
      next(error);
    }
  }

  async getAllByDistance(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProductService2.getAllDataByDistance(req);
      res.status(200).json(data);
    } catch (error) {}
  }

  async getAllData(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProductService2.getAllData();
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}
