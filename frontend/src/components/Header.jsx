import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">🛍️ Shop</Link>
        </div>
        <nav className="nav-links">
          <Link to="/">Каталог</Link>
          <Link to="/cart" className="cart-link">
            🛒 Корзина
            {cartItems.length > 0 && (
              <span className="cart-count">{cartItems.length}</span>
            )}
          </Link>
          {user ? (
            <div className="user-info">
              <span>👤 {user.username}</span>
              <button onClick={handleLogout} className="logout-btn">Выйти</button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login">Вход</Link>
              <Link to="/register">Регистрация</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;