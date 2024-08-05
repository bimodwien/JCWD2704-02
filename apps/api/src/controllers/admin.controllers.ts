'use strict';
import { NextFunction, Request, Response } from 'express';
import AdminService from '@/services/admin.service';

export class AdminController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getAll(req);
      res.status(200).send({
        message: 'Admin Store Pagination',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getById(req);
      res.status(200).send({
        message: 'Admin Store by their ID',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { refresh_token } = await AdminService.login(req);
      res.status(200).cookie('refresh_token', refresh_token).send({
        message: 'login success',
        refresh_token: refresh_token,
      });
    } catch (error) {
      next(error);
    }
  }

  async validate(req: Request, res: Response, next: NextFunction) {
    try {
      const refresh_token = await AdminService.validate(req);
      res.send({ refresh_token });
    } catch (error) {
      next(error);
    }
  }

  async createStoreAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.create(req);
      res.status(201).send({
        message: 'Admin Store has been created',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async editStoreAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.update(req);
      res.status(201).send({
        message: 'Admin Store has been edited',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteStoreAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.deleteUser(req);
      res.status(201).send({
        message: 'Admin Store has been deleted',
      });
    } catch (error) {
      next(error);
    }
  }
}
