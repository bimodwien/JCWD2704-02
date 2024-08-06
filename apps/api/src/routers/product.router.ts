import { Router } from 'express';
import { ProductController } from '@/controllers/product.controller';
import { blobUploader } from '@/lib/multer';
import { validateToken } from '@/middleware/auth.middleware';
import { verifyAdmin } from '@/middleware/role.middleware';

export class ProductRouter {
  private router: Router;
  private productController: ProductController;

  constructor() {
    this.productController = new ProductController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      '/',
      validateToken,
      verifyAdmin,
      this.productController.getByAll,
    );
    this.router.get('/all', this.productController.getAllByDistance);
    this.router.get('/allData', this.productController.getAllData);
    this.router.get('/:id', this.productController.getProductById);
    this.router.post(
      '/',
      validateToken,
      verifyAdmin,
      blobUploader().single('image'),
      this.productController.createProduct,
    );
    this.router.patch(
      '/:id',
      validateToken,
      verifyAdmin,
      blobUploader().single('image'),
      this.productController.editProduct,
    );
    this.router.delete(
      '/:id',
      validateToken,
      verifyAdmin,
      this.productController.deleteProduct,
    );
    this.router.get('/images/:id', this.productController.render);
  }

  getRouter(): Router {
    return this.router;
  }
}
