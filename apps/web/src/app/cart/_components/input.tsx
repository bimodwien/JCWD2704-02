import React, { useEffect, useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { axiosInstance } from '@/lib/axios';
import { QtyProps } from '@/models/cart.model';
import { useDebounce } from 'use-debounce';

const Quantity: React.FC<QtyProps> = ({ cart, fetchCart }) => {
  const [quantity, setQuantity] = useState(cart.quantity);
  const [prevQuantity, setPrevQuantity] = useState(cart.quantity);
  const [debouncedQuantity] = useDebounce(quantity, 1000);
  const hasBuyGetDiscount = cart.stock?.ProductDiscount?.some(
    (discount: any) => discount.category === 'buyGet',
  );
  const buyGetThreshold = Math.floor(cart.stock?.quantity / 2);
  const maxQuantity = hasBuyGetDiscount
    ? buyGetThreshold
    : cart.stock?.quantity;

  useEffect(() => {
    if (debouncedQuantity !== undefined) {
      updateQuantity(cart.id, debouncedQuantity);
      if (debouncedQuantity === 0) {
        setQuantity(1);
      }
    }
  }, [debouncedQuantity]);

  const updateQuantity = async (cartId: string, newQuantity: number) => {
    try {
      await axiosInstance().patch(`/cart/${cartId}`, {
        quantity: newQuantity,
      });
      fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setQuantity(prevQuantity);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      let newQuantity = quantity - 1;
      if (hasBuyGetDiscount && quantity > buyGetThreshold) {
        newQuantity = buyGetThreshold;
      } else if (!hasBuyGetDiscount && quantity > cart.stock?.quantity) {
        newQuantity = cart.stock?.quantity;
      }
      setPrevQuantity(quantity);
      setQuantity(newQuantity);
    } else {
      toast.warning('Minimum Quantity Reached', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const handleIncrement = () => {
    const newQuantity = quantity + 1;
    if (newQuantity > maxQuantity) {
      toast.warning('Stock Limit Reached', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } else {
      setPrevQuantity(quantity);
      setQuantity(newQuantity);
    }
  };

  const handleManual = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newQuantity = parseInt(event.target.value);
    if (isNaN(newQuantity)) {
      newQuantity = 0;
    } else {
      newQuantity = Math.min(Math.max(0, newQuantity), maxQuantity);
    }
    setPrevQuantity(quantity);
    setQuantity(newQuantity);
  };

  return (
    <div className="flex gap-2 items-center">
      <div className="flex justify-center gap-1 items-center p-1 border border-gray-400 bg-white rounded-full">
        <button
          className="text-xs flex justify-center items-center w-6 h-6 rounded-full text-white bg-blue-600"
          onClick={handleDecrement}
        >
          <FaMinus />
        </button>
        <input
          type="text"
          className="w-10 h-6 text-center"
          value={quantity.toString()}
          onChange={handleManual}
          style={{ outline: 'none' }}
        />
        <button
          className={`text-xs flex justify-center items-center w-6 h-6 rounded-full text-white bg-blue-600`}
          onClick={handleIncrement}
        >
          <FaPlus />
        </button>
      </div>
    </div>
  );
};

export default Quantity;
