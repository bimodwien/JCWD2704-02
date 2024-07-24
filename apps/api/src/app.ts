import express, {
  json,
  urlencoded,
  Express,
  Request,
  Response,
  NextFunction,
  Router,
} from 'express';
import cors from 'cors';
import { CartRouter } from './routers/cart.router';
import { OrderRouter } from './routers/order.router';
import { PORT } from './config';
import { UserRouter } from './routers/user.router';
import { ProductRouter } from './routers/product.router';
import { CategoryRouter } from './routers/category.router';
import { AdminRouter } from './routers/admin.router';
import { corsOptions } from './config/index';
import { StoreRouter } from './routers/store.router';
import { StockRouter } from './routers/stock.router';
import { VoucherRouter } from './routers/voucher.router';
import { DiscountRouter } from './routers/discount.router';

export default class App {
  private app: Express;

  constructor() {
    this.app = express();
    this.configure();
    this.routes();
    this.handleError();
  }

  private configure(): void {
    this.app.use(cors(corsOptions));
    this.app.use(json());
    this.app.use(urlencoded({ extended: true }));
  }

  private handleError(): void {
    // not found
    this.app.use(
      (error: unknown, req: Request, res: Response, next: NextFunction) => {
        if (req.path.includes('/api/')) {
          res.status(404).send('Not found !');
        } else {
          next();
        }
      },
    );

    this.app.use(
      (err: Error, req: Request, res: Response, next: NextFunction) => {
        if (req.path.includes('/v1')) {
          console.error('Error : ', err.stack);
          res.status(500).send('Error !');
        } else {
          next();
        }
      },
    );
  }

  private routes(): void {
    const cartRouter = new CartRouter();
    const orderRouter = new OrderRouter();
    const userRouter = new UserRouter();
    const productRouter = new ProductRouter();
    const adminRouter = new AdminRouter();
    const storeRouter = new StoreRouter();
    const categoryRouter = new CategoryRouter();
    const stockRouter = new StockRouter();
    const discountRouter = new DiscountRouter();
    const voucherRouter = new VoucherRouter();

    this.app.get('/api', (req: Request, res: Response) => {
      res.send(`Hello, Purwadhika Student API!`);
    });

    this.app.use('/cart', cartRouter.getRouter());
    this.app.use('/order', orderRouter.getRouter());
    this.app.use('/v1', userRouter.getRouter());
    this.app.use('/products', productRouter.getRouter());
    this.app.use('/admins', adminRouter.getRouter());
    this.app.use('/store', storeRouter.getRouter());
    this.app.use('/category', categoryRouter.getRouter());
    this.app.use('/stocks', stockRouter.getRouter());
    this.app.use('/discounts', discountRouter.getRouter());
    this.app.use('/vouchers', voucherRouter.getRouter());
  }

  public start(): void {
    this.app.listen(PORT, () => {
      console.log(`  ➜  [API] Local:   http://localhost:${PORT}/`);
    });
  }
}
