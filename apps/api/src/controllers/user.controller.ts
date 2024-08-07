import { Request, Response, NextFunction } from 'express';
// import passport from 'passport';
import UserService from '../services/user.service';
import User2Service from '@/services/user-2.service';

export class UserController {
  async addEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await UserService.addEmail(req);
      res.status(201).send({
        message: 'Success Add Email',
        data,
      });
    } catch (error) {
      console.log('====================================');
      console.log(error);
      console.log('====================================');
      next(error);
    }
  }

  async updateSignUp(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await UserService.udpateSignUp(req);
      res.status(201).send({
        message: 'Success Register',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async sendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await UserService.registerVerify(req);
      res.status(200).redirect(`http://localhost:3000/signUp/${data.id}`);
    } catch (error) {
      next(error);
    }
  }

  async signIn(req: Request, res: Response, next: NextFunction) {
    try {
      const { accessToken, refreshToken } = await UserService.signIn(req);
      res
        .cookie('access_token', accessToken)
        .cookie('refresh_token', refreshToken)
        .send({
          message: 'user login',
          access_token: accessToken,
          refresh_token: refreshToken,
        });
    } catch (error) {
      next(error);
    }
  }

  async Location(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await UserService.Location(req);
      // console.log('====================================');
      // console.log(data);
      // console.log('====================================');
      res.send({
        message: 'Location has been save',
        // data,
      });
    } catch (error) {
      next(error);
    }
  }

  async signUByGoogle(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await UserService.regisWithGoogle(req);
      res.send({
        message: 'Regis by google success',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async signInByGoogle(req: Request, res: Response, next: NextFunction) {
    try {
      const { accessToken, refreshToken } =
        await UserService.loginWithGoogle(req);
      res
        .cookie('access_token', accessToken)
        .cookie('refresh_token', refreshToken)
        .send({
          message: 'user login',
        });
    } catch (error) {
      next(error);
    }
  }

  async referralCode(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await UserService.referralCode(req);
      res.send({
        message: 'Refferal Code succsess',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async checkEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await User2Service.checkEmail(req);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async verifResetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await User2Service.resetPasswordVerify(req);
      res
        .status(200)
        .redirect(`http://localhost:3000/resetPassword/addPassword/${data.id}`);
    } catch (error) {
      next(error);
    }
  }

  async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await User2Service.updatePassword(req);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await User2Service.updateProfile(req);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async validateUser(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('siniii');
      const access_token = await User2Service.validate(req);
      res.send({
        access_token,
      });
      console.log('woyyy');
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
