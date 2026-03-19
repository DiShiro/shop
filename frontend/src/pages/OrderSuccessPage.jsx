import React from 'react';
import { Link } from 'react-router-dom';

const OrderSuccessPage = () => {
  return (
    <div className="order-success">
      <h1>Заказ оформлен!</h1>
      <p>Спасибо за покупку.</p>
      <Link to="/">Вернуться в каталог</Link>
    </div>
  );
};

export default OrderSuccessPage;