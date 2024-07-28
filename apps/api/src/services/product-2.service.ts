import { Request } from 'express';
import prisma from '@/prisma';
import sharp from 'sharp';
import { TProduct } from '@/models/product.model';
import { Prisma } from '@prisma/client';
import haversine from 'haversine-distance';

class ProductService2 {
  static async getAllDataByDistance(req: Request) {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude)
      throw new Error('Latitude and longitude are required.');

    try {
      const userLatitude = parseFloat(latitude as string);
      const userLongitude = parseFloat(longitude as string);

      const products = await prisma.product.findMany({
        where: {
          isDeleted: false,
          Stock: {
            some: {
              quantity: {
                gt: 0,
              },
            },
          },
        },
        include: {
          Stock: {
            include: {
              store: true,
            },
          },
          ProductImage: {
            select: { id: true, image: true },
          },
        },
      });

      const productsWithDistance = products.map((product) => {
        const stockWithDistance = product.Stock.map((stock) => {
          const storeLocation = {
            lat: stock.store.latitude,
            lon: stock.store.longitude,
          };
          const userLocation = {
            lat: userLatitude,
            lon: userLongitude,
          };
          const distance = haversine(storeLocation, userLocation);

          return {
            ...stock,
            distance,
          };
        });

        const availableStock = stockWithDistance
          .filter((stock) => stock.quantity > 0)
          .sort((a, b) => a.distance - b.distance);

        return {
          ...product,
          Stock: availableStock,
        };
      });

      const sortedProducts = productsWithDistance
        .filter((product) => product.Stock.length > 0)
        .sort((a, b) => {
          const aClosestStock = a.Stock[0].distance;
          const bClosestStock = b.Stock[0].distance;
          return aClosestStock - bClosestStock;
        });

      return sortedProducts;
    } catch (error) {
      throw error;
    }
  }

  static async getAllData() {
    return await prisma.product.findMany({
      where: {
        isDeleted: false,
        Stock: {
          some: {
            quantity: {
              gt: 0,
            },
          },
        },
      },
      include: {
        Stock: {
          include: {
            store: true,
          },
        },
        ProductImage: {
          select: { id: true, image: true },
        },
      },
    });
  }
}

export default ProductService2;
