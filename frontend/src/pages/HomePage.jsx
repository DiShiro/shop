import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import './HomePage.css';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Ошибка загрузки товаров', error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="home">
      <h1>Товары</h1>
      <div className="product-list">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.image || 'https://via.placeholder.com/150'} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p className="price">{product.price} ₽</p>
            <button onClick={() => addToCart(product)}>В корзину</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;