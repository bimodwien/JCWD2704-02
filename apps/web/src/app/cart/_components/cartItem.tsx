import React from 'react';
import { GoTrash } from 'react-icons/go';
import Quantity from './input';
import Swal from 'sweetalert2';
import { axiosInstance } from '@/lib/axios';
import { CartTableProps, TCart } from '@/models/cart.model';
import { formatPrice, productSrc } from '@/helpers/format';

const CartList: React.FC<CartTableProps> = ({
  cartData,
  fetchCart,
  totalProduct,
}) => {
  const deleteCart = async (cartId: string) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      });

      if (result.isConfirmed) {
        await axiosInstance().delete(`/cart/${cartId}`);
        Swal.fire({
          title: 'Deleted!',
          text: 'Your cart item has been deleted.',
          icon: 'success',
        });
        fetchCart();
      }
    } catch (error) {
      console.error('Error deleting cart:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete cart item.',
        icon: 'error',
      });
    }
  };

  const getPrice = (cart: TCart) => {
    if (cart.stock?.priceDiscount) {
      return cart.stock.priceDiscount;
    }
    return cart.product.price;
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex flex-col gap-2 w-full">
        {cartData?.map((cart) => {
          const stockQuantity = cart.stock?.quantity ?? 0;
          const isOutOfStock = stockQuantity === 0;
          const isInsufficientStock = cart.quantity > stockQuantity;
          const price = getPrice(cart);

          return (
            <div
              key={cart.id}
              className={`flex flex-col justify-between h-full rounded-xl border border-gray-300 overflow-hidden ${isOutOfStock ? 'bg-red-50' : isInsufficientStock ? 'bg-gray-50' : ''}`}
            >
              {isInsufficientStock && (
                <span
                  className={`${isOutOfStock ? 'bg-red-100' : 'bg-gray-100'} font-medium w-full px-2 py-1 text-xs lg:text-sm text-red-700`}
                >
                  {isOutOfStock ? '*out of stock ' : '*insufficient stock '}
                </span>
              )}
              <div className="flex justify-between gap-1 p-2 lg:p-3 lg:items-center">
                <div className="flex gap-2 lg:gap-4 items-center w-full lg:w-[400px]">
                  <img
                    className={`h-14 w-14 lg:h-20 lg:w-20 object-cover rounded ${
                      isInsufficientStock ? 'grayscale-[70%]' : ''
                    }`}
                    src={`${productSrc}${cart.product.ProductImage[0].id}`}
                    alt={cart.product.name}
                  />
                  <div
                    className={`font-medium flex flex-col text-wrap gap-1 text-sm ${
                      isInsufficientStock ? 'text-gray-500' : ''
                    }`}
                  >
                    <div
                      className="text-wrap overflow-hidden lg:text-base lg:font-semibold"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {cart.product.name}
                    </div>
                    <span className="font-normal md:font-medium">
                      {formatPrice(price)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 justify-between">
                  <div
                    className={`text-sm text-right font-semibold lg:hidden ${
                      isInsufficientStock ? 'text-gray-500 ' : ''
                    }`}
                  >
                    {formatPrice(totalProduct(cart.quantity, price))}
                  </div>
                  <div className="flex gap-1 items-center justify-end lg:w-32 lg:items-center lg:justify-center lg:gap-2">
                    <button
                      onClick={() => deleteCart(cart.id)}
                      className="text-red-700 p-1"
                    >
                      <GoTrash />
                    </button>
                    <div className="text-sm">
                      <Quantity cart={cart} fetchCart={fetchCart} />
                    </div>
                  </div>
                </div>
                <div
                  className={`text-sm text-right hidden lg:block lg:text-right font-semibold lg:w-32 lg:text-base ${
                    isInsufficientStock ? 'text-gray-500' : ''
                  }`}
                >
                  {formatPrice(totalProduct(cart.quantity, price))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CartList;
