import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/auth/register', formData);
      setMessage('Регистрация успешна!');
      console.log(response.data);
      setFormData({ username: '', email: '', password: '' });
    } catch (error) {
      setMessage('Ошибка: ' + (error.response?.data?.error || 'Сервер не отвечает'));
    }
  };

  return (
    <div className="container">
      <div className="form-card">
        <h1>Регистрация</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Имя пользователя"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Пароль"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Зарегистрироваться</button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default App;