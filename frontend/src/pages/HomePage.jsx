import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
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

const defaultProductsList = [
  {
    id: 1,
    name: 'Смартфон X200',
    description: '6.7" OLED, 128 ГБ, тройная камера, быстрая зарядка',
    price: 49990,
    image: phoneImg,
  },
  {
    id: 2,
    name: 'Ноутбук Pro 15',
    description: 'Intel Core i7, 16 ГБ RAM, SSD 512 ГБ, RTX 3060',
    price: 89990,
    image: laptopImg,
  },
  {
    id: 3,
    name: 'Беспроводные наушники',
    description: 'Active Noise Cancelling, 30 ч работы, Bluetooth 5.2',
    price: 12990,
    image: headphonesImg,
  },
  {
    id: 4,
    name: 'Умные часы',
    description: 'GPS, мониторинг здоровья, AMOLED-дисплей',
    price: 19990,
    image: smartwatchImg,
  },
  {
    id: 5,
    name: 'Планшет Tab S',
    description: '10.5" 120 Гц, стилус в комплекте, 128 ГБ',
    price: 35990,
    image: tabletImg,
  },
  {
    id: 6,
    name: 'Игровая консоль',
    description: '4K, 1 ТБ, беспроводной контроллер',
    price: 44990,
    image: consoleImg,
  },
];

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/products');
        console.log(response.data);
        
        if (Array.isArray(response.data) && response.data.length === 0) {
          setProducts(defaultProductsList);
          return;
        }
        setProducts(response.data);
      } catch (error) {
        console.error('Ошибка загрузки товаров', error);
      }
    };
    fetchProducts();
  }, []);

  const getImageSrc = (product) => {
    if (productImages[product.id]) {
      return productImages[product.id];
    }
    if (product.image && typeof product.image === 'string') {
      return product.image;
    }
    return 'https://via.placeholder.com/300x200?text=Нет+фото';
  };

  const shouldUseContain = (productId) => {
    return productId === 1 || productId === 5;
  };

  const handleAddToCart = (product) => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    addToCart(product);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center relative after:content-[''] after:block after:w-24 after:h-1 after:bg-blue-500 after:mx-auto after:mt-2">
        Товары
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.isArray(products) && products.map(product => {
          const useContain = shouldUseContain(product.id);
          return (
            <div key={product.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col">
              <div className={`
                w-full h-48 flex items-center justify-center overflow-hidden
                ${useContain ? 'bg-white' : 'bg-gray-100'}
              `}>
                <img
                  src={getImageSrc(product)}
                  alt={product.name}
                  className={`
                    w-full h-full transition-transform duration-300 hover:scale-105
                    ${useContain ? 'object-contain' : 'object-cover'}
                  `}
                />
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-1">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">{product.price.toLocaleString()} ₽</span>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    В корзину
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HomePage;