import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import './CartPage.css';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, totalPrice } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Корзина пуста</h2>
        <Link to="/">Вернуться к покупкам</Link>
      </div>
    );
  }

  return (
    <div className="cart">
      <h1>Корзина</h1>
      <div className="cart-items">
        {cartItems.map(item => (
          <div key={item.id} className="cart-item">
            <img src={item.image || 'https://via.placeholder.com/80'} alt={item.name} />
            <div className="item-info">
              <h3>{item.name}</h3>
              <p>{item.price} ₽</p>
            </div>
            <div className="item-quantity">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
            </div>
            <div className="item-total">{item.price * item.quantity} ₽</div>
            <button onClick={() => removeFromCart(item.id)}>Удалить</button>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <h3>Итого: {totalPrice} ₽</h3>
        <Link to="/checkout" className="checkout-btn">Оформить заказ</Link>
      </div>
    </div>
  );
};

export default CartPage;