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
import { DiscountRouter } from './routers/discount.router';
import { VoucherRouter } from './routers/voucher.router';
import { ReportRouter } from './routers/sales.report.router';
import { StockHistoryRouter } from './routers/stock.history.router';

export default class App {
  private app: Express;

  constructor() {
    this.app = express();
    this.configure();
    this.routes();
    // this.handleError();
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
        if (error instanceof Error)
          res.status(500).send({
            message: error.message,
          });
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
    const stockHistory = new StockHistoryRouter();
    const discountRouter = new DiscountRouter();
    const voucherRouter = new VoucherRouter();
    const reportRouter = new ReportRouter();

    this.app.get('/api', (req: Request, res: Response) => {
      res.send(`Hello, Purwadhika Student API!`);
    });

    this.app.use('/api/carts', cartRouter.getRouter());
    this.app.use('/api/orders', orderRouter.getRouter());
    this.app.use('/api/v1', userRouter.getRouter());
    this.app.use('/api/products', productRouter.getRouter());
    this.app.use('/api/admins', adminRouter.getRouter());
    this.app.use('/api/store', storeRouter.getRouter());
    this.app.use('/api/category', categoryRouter.getRouter());
    this.app.use('/api/stocks', stockRouter.getRouter());
    this.app.use('/api/stock-history', stockHistory.getRouter());
    this.app.use('/api/discounts', discountRouter.getRouter());
    this.app.use('/api/vouchers', voucherRouter.getRouter());
    this.app.use('/api/reports', reportRouter.getRouter());
  }

  public start(): void {
    this.app.listen(PORT, () => {
      console.log(`  ➜  [API] Local:   http://localhost:${PORT}/`);
    });
  }
}
