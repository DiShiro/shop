import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header = () => {
  const { user, logout } = useAuth();
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    clearCart();
    navigate('/');
  };

  return (
    <header className="bg-gray-800 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="logo">
          <Link to="/" className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition">
            Shop
          </Link>
        </div>
        <nav className="flex items-center space-x-6">
          <Link to="/" className="hover:text-blue-400 transition">Каталог</Link>
          <Link to="/cart" className="flex items-center gap-1 hover:text-blue-400 transition">
            Корзина
            {cartItems.length > 0 && (
              <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </Link>
          {user && (
            <Link to={user.role === 'admin' ? '/admin/support' : '/support'} className="hover:text-blue-400 transition">
              Поддержка
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-blue-400">{user.username}</span>
              <button
                onClick={handleLogout}
                className="border border-blue-400 text-blue-400 px-3 py-1 rounded-full hover:bg-blue-400 hover:text-white transition"
              >
                Выйти
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link to="/login" className="bg-blue-500/20 px-3 py-1 rounded-full hover:bg-blue-500 hover:text-white transition">
                Вход
              </Link>
              <Link to="/register" className="bg-blue-500/20 px-3 py-1 rounded-full hover:bg-blue-500 hover:text-white transition">
                Регистрация
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;