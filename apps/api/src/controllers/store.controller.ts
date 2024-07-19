import { Request, Response, NextFunction } from 'express';
import StoreService from '@/services/store.service';

export class StoreController {
  async createStore(req: Request, res: Response, next: NextFunction) {
    try {
      const store = await StoreService.createStore(req);
      res.status(201).json(store);
    } catch (error) {
      next(error);
    }
  }

  async getStoresAll(req: Request, res: Response, next: NextFunction) {
    try {
      const stores = await StoreService.getStoresAll(req);
      res.status(200).json(stores);
    } catch (error) {
      next(error);
    }
  }
}
