import { TUser } from './admin.model';
import { TStore } from './store.model';
import { TCategory } from './category.models';
import { TProduct } from './product.model';

declare global {
  namespace Express {
    interface Request {
      user: TUser;
      store: TStore;
      category: TCategory;
      product: TProduct;
    }
  }
}
