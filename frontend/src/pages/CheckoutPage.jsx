import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';


import phoneImg from '../image/smartphone.jpg';
import laptopImg from '../image/laptop.jpg';
import headphonesImg from '../image/headphones.jpg';
import smartwatchImg from '../image/smartwatch.jpg';
import tabletImg from '../image/tablet.jpg';
import consoleImg from '../image/console.jpg';

const productImages = {
  1: phoneImg,
  2: laptopImg,
  3: headphonesImg,
  4: smartwatchImg,
  5: tabletImg,
  6: consoleImg,
};

const getImageSrc = (product) => {
  if (productImages[product.id]) {
    return productImages[product.id];
  }
  if (product.image && typeof product.image === 'string') {
    return product.image;
  }
  return 'https://via.placeholder.com/80?text=Нет+фото';
};

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, totalPrice } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Корзина пуста</h2>
          <Link to="/" className="inline-block bg-gray-800 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition">
            Вернуться к покупкам
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center relative after:content-[''] after:block after:w-24 after:h-1 after:bg-blue-500 after:mx-auto after:mt-2">
        Корзина
      </h1>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {cartItems.map(item => (
          <div key={item.id} className="flex flex-col sm:flex-row items-center justify-between p-4 border-b last:border-b-0 gap-4">
            <img
              src={getImageSrc(item)}
              alt={item.name}
              className="w-20 h-20 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-800 truncate">{item.name}</h3>
              <p className="text-gray-600">{item.price} ₽</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="w-8 h-8 border border-gray-300 rounded hover:bg-gray-800 hover:text-white transition"
              >
                -
              </button>
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="w-8 h-8 border border-gray-300 rounded hover:bg-gray-800 hover:text-white transition"
              >
                +
              </button>
            </div>
            <div className="font-bold text-gray-800 min-w-[80px] text-right">
              {item.price * item.quantity} ₽
            </div>
            <button
              onClick={() => removeFromCart(item.id)}
              className="text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-600 hover:text-white transition"
            >
              Удалить
            </button>
          </div>
        ))}
      </div>
      <div className="mt-6 bg-white rounded-lg shadow-md p-4 flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Итого: {totalPrice} ₽</h3>
        <Link to="/checkout" className="bg-gray-800 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition">
          Оформить заказ
        </Link>
      </div>
    </div>
  );
};

export default CartPage;