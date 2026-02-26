import React, { useState } from 'react';
import axios from 'axios';

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
      // Отправляем данные на твой бэкенд
      const response = await axios.post('http://localhost:3000/api/auth/register', formData);
      setMessage('Успех! Пользователь зарегистрирован.');
      console.log(response.data);
    } catch (error) {
      setMessage('Ошибка: ' + (error.response?.data?.error || 'Сервер не отвечает'));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
      <h1>Регистрация</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '300px', gap: '10px' }}>
        <input name="username" placeholder="Имя пользователя" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Пароль" onChange={handleChange} required />
        <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>Создать аккаунт</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default App;