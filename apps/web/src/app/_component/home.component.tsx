'use client';
import Autoplay from 'embla-carousel-autoplay';
import { Card, CardContent } from '@/components/ui/card';
import React, { useRef, useEffect, useState } from 'react';
import { FaLocationDot } from 'react-icons/fa6';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useAppSelector } from '../../../hooks';
import Image from 'next/image';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { TCategory } from '@/models/category';
import { getAll } from '@/helpers/fetchCategory';
import { TProduct } from '@/models/product';
import { getAllData, getNearestProducts } from '@/helpers/fetchProduct';
import { useRouter } from 'next/navigation';
import { categorySrc, productSrc } from '@/helpers/format';
import { axiosInstance } from '@/lib/axios';

export default function HomeComponent() {
  const user = useAppSelector((state) => state.auth);
  const [category, setCategory] = useState<TCategory[]>([]);
  const [products, setProducts] = useState<TProduct[]>([]);
  const [allProducts, setAllProducts] = useState<TProduct[]>([]);
  const router = useRouter();

  const getLocation = async (latitude: any, longitude: any) => {
    try {
      // if (!user.id) {
      //   console.error('User ID is not available');
      //   return;
      // }

      const response = await axiosInstance().patch(`/v1/location`, {
        latitude,
        longitude,
      });

      return response;
    } catch (error) {}
  };

  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true }),
  );

  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

            getLocation(latitude, longitude);
            getNearestProducts(latitude, longitude, setProducts);
          },
          (error) => {
            console.error('Error getting user location:', error.message);
          },
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
      }
    };

    // if (user && user.id) {
    //   getUserLocation();
    // } else {
    //   console.error('User ID is not available');
    // }
    getUserLocation();
  }, []);

  useEffect(() => {
    getAll(setCategory);
    getAllData(setAllProducts);
  }, []);

  function handleProductClick(id: string) {
    router.push(`/detail/${id}`);
  }

  return (
    <>
      <div className="">
        <div className="absolute">
          {user && user.id ? (
            <div className="hidden">
              <button className="login-button">Register</button>
              <button className="login-button">Login</button>
            </div>
          ) : (
            <div className="fixed bottom-0 w-full grid-cols-1 grid p-2 gap-1.5 z-10 text-white">
              <button
                className="login-button p-2 bg-[#5AC268] rounded-[8px]"
                onClick={() => router.push('/signUp')}
              >
                Register
              </button>
              <button
                className="login-button p-2 bg-[#5AC268] rounded-[8px]"
                onClick={() => router.push('/login')}
              >
                Login
              </button>
            </div>
          )}
        </div>
        <div className="">
          <Carousel
            plugins={[plugin.current]}
            className="w-full max-w-xs"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
          >
            <CarouselContent>
              {Array.from({ length: 5 }).map((_, index) => (
                <CarouselItem key={index}>
                  <div className="">
                    <img
                      src="/img/promo.jpg"
                      alt="Image 1"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className="p-2">
            <div className="flex border-t-[1px] border-b-[1px]">
              <ScrollArea className="w-screen bg-white whitespace-nowrap rounded-md border p-2">
                <div className="flex gap-1.5">
                  {category.map((cat, index) => (
                    <div key={index} className="text-center">
                      <img
                        src={`${categorySrc}${cat.id}`}
                        height={50}
                        width={50}
                        alt={cat.name}
                      />
                      <p className="text-sm">{cat.name}</p>
                    </div>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
            <div className="mt-2 font-bold">
              <ScrollArea className="">
                <div className="flex">
                  <div className="w-50 mr-2">
                    <Card className="p-1">Low Price</Card>
                  </div>
                  <div className="w-50">
                    <Card className="p-1">High Price</Card>
                  </div>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
            <div>
              <p className="text-[14px] p-1">
                {user && user.id ? 'Products Near' : 'All Products'}
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {(user && user.id ? products : allProducts).map(
                  (product, index) => (
                    <Card
                      key={index}
                      onClick={() => handleProductClick(product.id)}
                    >
                      <img
                        src={`${productSrc}${product.ProductImage[0].id}`}
                        width="200"
                        height="200"
                      />
                      <div className="text-[14px] p-2">
                        <p>{product.name}</p>
                        <p className="font-bold">Rp {product.price}</p>
                        {user && user.id && (
                          <div className="flex pt-1 pl-1">
                            <FaLocationDot className="mt-[3px] mr-[3px]" />
                            <p>{product.Stock[0]?.store.city}</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
