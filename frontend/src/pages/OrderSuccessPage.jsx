import React from 'react';
import { Link } from 'react-router-dom';

const OrderSuccessPage = () => {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Заказ оформлен!</h1>
        <p className="text-gray-600 mb-6">Спасибо за покупку.</p>
        <Link to="/" className="inline-block bg-gray-800 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition">
          Вернуться в каталог
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;