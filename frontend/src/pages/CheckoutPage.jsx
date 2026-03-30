import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const CheckoutPage = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login?redirect=checkout');
      return;
    }
    setLoading(true);
    try {
      const items = cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      }));
      await axios.post('http://localhost:3000/api/orders', { items });
      clearCart();
      navigate('/orders/success');
    } catch (err) {
      setError('Ошибка при оформлении заказа. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

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

  // Если пользователь не авторизован, показываем сообщение
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Требуется авторизация</h2>
          <p className="text-gray-600 mb-6">
            Для оформления заказа необходимо войти в аккаунт.
          </p>
          <Link to="/login?redirect=checkout" className="inline-block bg-gray-800 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition">
            Войти
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center relative after:content-[''] after:block after:w-24 after:h-1 after:bg-blue-500 after:mx-auto after:mt-2">
        Оформление заказа
      </h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-blue-500 inline-block pb-1">Ваш заказ</h3>
        <div className="space-y-2 mt-4">
          {cartItems.map(item => (
            <div key={item.id} className="flex justify-between py-2 border-b border-dashed last:border-none">
              <span>{item.name} x {item.quantity}</span>
              <span className="font-medium">{item.price * item.quantity} ₽</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-2 text-right text-xl font-bold text-gray-800 border-t-2 border-gray-300">
          Итого: {totalPrice} ₽
        </div>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-800 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Оформление...' : 'Подтвердить заказ'}
        </button>
        {error && <p className="text-red-600 text-center mt-4">{error}</p>}
      </form>
    </div>
  );
};

export default CheckoutPage;