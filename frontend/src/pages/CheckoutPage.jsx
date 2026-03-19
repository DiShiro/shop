import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './CheckoutPage.css';

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
    return <div>Корзина пуста</div>;
  }

  return (
    <div className="checkout">
      <h1>Оформление заказа</h1>
      <div className="order-summary">
        <h3>Ваш заказ</h3>
        {cartItems.map(item => (
          <div key={item.id} className="order-item">
            <span>{item.name} x {item.quantity}</span>
            <span>{item.price * item.quantity} ₽</span>
          </div>
        ))}
        <div className="total">Итого: {totalPrice} ₽</div>
      </div>
      <form onSubmit={handleSubmit}>
        {!user && <p>Необходимо <Link to="/login?redirect=checkout">войти</Link></p>}
        <button type="submit" disabled={loading || !user}>
          {loading ? 'Оформление...' : 'Подтвердить заказ'}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default CheckoutPage;