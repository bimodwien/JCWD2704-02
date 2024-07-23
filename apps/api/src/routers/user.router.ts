import { log } from 'handlebars';
import { UserController } from '../controllers/user.controller';
import { Router } from 'express';

export class UserRouter {
  private router: Router;
  private userController: UserController;

  constructor() {
    this.userController = new UserController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/addemail', this.userController.addEmail);
    this.router.post('/signIn', this.userController.signIn);
    this.router.post('/signUpWithGoogle', this.userController.signUByGoogle);
    this.router.post('/signInWithGoogle', this.userController.signInByGoogle);
    this.router.post('/check-email-reset-pass', this.userController.checkEmail);
    this.router.patch(
      '/update-password/:id',
      this.userController.updatePassword,
    );
    this.router.get('/verify/:token', this.userController.sendVerification);
    this.router.patch('/updateSignUp/:id', this.userController.updateSignUp);
    this.router.patch('/location/:id', this.userController.Location);
    this.router.patch('/refferalCode/:id', this.userController.referralCode);
    this.router.get(
      '/verif-token-reset-pass/:token',
      this.userController.verifResetPassword,
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
