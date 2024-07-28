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

  async softDeleteStore(req: Request, res: Response, next: NextFunction) {
    try {
      const store = await StoreService.softDeleteStore(req);
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

  async getStoreByStoreId(req: Request, res: Response, next: NextFunction) {
    try {
      const store = await StoreService.getStoresByStoreID(req);
      res.status(200).json(store);
    } catch (error) {
      next(error);
    }
  }

  async updateStore(req: Request, res: Response, next: NextFunction) {
    try {
      const store = await StoreService.updateStore(req);
      res.status(200).json(store);
    } catch (error) {
      next(error);
    }
  }

  async availableStores(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await StoreService.getAvailableStores();
      console.log('====================================');
      console.log('ini data', data);
      console.log('====================================');
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}
