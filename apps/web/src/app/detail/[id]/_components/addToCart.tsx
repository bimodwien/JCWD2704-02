import React, { useEffect, useState } from 'react';
import { PiTrolleyFill } from 'react-icons/pi';
import { axiosInstance } from '@/lib/axios';
import { TStock } from '@/models/stock';
import { TStore } from '@/models/store.model';
import { FaMinus, FaPlus } from 'react-icons/fa6';
import Swal from 'sweetalert2';
import { formatPrice } from '@/helpers/format';

const AddToCartButton = ({ productId }: { productId: string }) => {
  const [stores, setStores] = useState<TStore[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [stock, setStock] = useState<TStock | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [priceDiscount, setPriceDiscount] = useState<number | null>(null);
  const [hasBuyGetDiscount, setHasBuyGetDiscount] = useState<boolean>(false);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await axiosInstance().get('/cart/store');
        const { data } = response.data;

        if (Array.isArray(data)) {
          setStores(data);
        } else {
          console.error(data);
        }
      } catch (error) {
        console.error('Error fetching stores:', error);
      }
    };

    fetchStores();
  }, []);

  const handleDecrement = () => {
    if (quantity > 0) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleIncrement = () => {
    if (stock) {
      const limit = hasBuyGetDiscount
        ? Math.floor(stock.quantity / 2)
        : stock.quantity;

      if (quantity < limit) {
        setQuantity((prev) => prev + 1);
      }
    }
  };

  const handleManual = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newQuantity = parseInt(event.target.value, 10);
    const stockQuantity = stock?.quantity ?? 0;
    const limit = hasBuyGetDiscount
      ? Math.floor(stockQuantity / 2)
      : stockQuantity;

    if (isNaN(newQuantity)) {
      newQuantity = 0;
    } else {
      newQuantity = Math.min(Math.max(0, newQuantity), limit);
    }
    setQuantity(newQuantity);
  };

  const handleAddToCart = async () => {
    try {
      if (!selectedStoreId || quantity <= 0) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Please select a store and specify a valid quantity.',
        });
        return;
      }

      const response = await axiosInstance().post('/cart/c', {
        productId,
        quantity,
        storeId: selectedStoreId,
      });

      if (response.status === 201) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Product added to cart successfully.',
        });
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while adding the product to the cart.',
      });
    }
  };

  const handleStoreChange = async (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const storeId = event.target.value;
    setSelectedStoreId(storeId);

    if (storeId) {
      try {
        const response = await axiosInstance().get('/cart/stock', {
          params: { productId, storeId },
        });
        const { data } = response.data;
        if (data && 'quantity' in data) {
          setStock(data);

          const discount = data.ProductDiscount?.find(
            (d: any) => d.category === 'discount',
          );
          setPriceDiscount(data.priceDiscount);

          const buyGet = data.ProductDiscount?.some(
            (d: any) => d.category === 'buyGet',
          );
          setHasBuyGetDiscount(buyGet);
        } else {
          console.error(data);
          setStock(null);
          setPriceDiscount(null);
          setHasBuyGetDiscount(false);
        }
      } catch (error) {
        console.error('Error fetching stock data:', error);
        setStock(null);
        setPriceDiscount(null);
        setHasBuyGetDiscount(false);
      }
    } else {
      setStock(null);
      setPriceDiscount(null);
      setHasBuyGetDiscount(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        {stock ? (
          <div className="mt-2 text-gray-700 font-medium h-32">
            Stock Quantity: {stock.quantity}
            {priceDiscount !== null && (
              <div className="text-red-500">
                Discounted Price:{' '}
                <span className="text-lg">{formatPrice(priceDiscount)}</span>
              </div>
            )}
            {hasBuyGetDiscount && (
              <div className="text-green-500">Buy One Get One Available</div>
            )}
          </div>
        ) : (
          <div className="mt-2 text-gray-700 font-medium h-32">
            Stock not available
          </div>
        )}
        <select
          id="store"
          value={selectedStoreId}
          onChange={handleStoreChange}
          className="bg-white border border-gray-300 text-gray-500 text-sm lg:text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 px-2 py-2 block w-60 "
        >
          <option value="">Select Store</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}, {store.distance} km
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex justify-center gap-1 items-center p-1 border border-gray-400 bg-white rounded-full">
          <button
            className="text-xs flex justify-center items-center w-6 h-6 rounded-full text-white bg-blue-600 disabled:bg-gray-400"
            onClick={handleDecrement}
            disabled={quantity <= 0}
          >
            <FaMinus />
          </button>
          <input
            type="text"
            value={quantity}
            onChange={handleManual}
            className="w-10 h-6 text-center"
            style={{ outline: 'none' }}
          />
          <button
            className={`text-xs flex justify-center items-center w-6 h-6 rounded-full text-white bg-blue-600 disabled:bg-gray-400`}
            onClick={handleIncrement}
            disabled={
              stock
                ? quantity >=
                  (hasBuyGetDiscount
                    ? Math.floor(stock.quantity / 2)
                    : stock.quantity)
                : true
            }
          >
            <FaPlus />
          </button>
        </div>
        <button
          onClick={handleAddToCart}
          className="w-full sm:w-fit text-white mt-4 sm:mt-0 bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none flex items-center justify-center"
        >
          <PiTrolleyFill className="mr-2" /> Add to cart
        </button>
      </div>
    </div>
  );
};

export default AddToCartButton;
