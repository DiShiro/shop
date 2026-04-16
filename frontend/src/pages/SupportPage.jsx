import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const SupportPage = () => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const intervalRef = useRef(null);

  const fetchMessages = async () => {
    if (!token) return;
    try {
      const res = await axios.get('http://localhost:3000/api/support/messages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchMessages();
      intervalRef.current = setInterval(fetchMessages, 4000);
      return () => clearInterval(intervalRef.current);
    }
  }, [user, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !token) return;
    setLoading(true);
    try {
      await axios.post('http://localhost:3000/api/support/messages',
        { content: input.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInput('');
      await fetchMessages();
    } catch (err) {
      setError('Ошибка отправки');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="container mx-auto px-4 py-8">Войдите в аккаунт</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Техподдержка</h1>
        <div className="border rounded-lg h-96 overflow-y-auto p-4 bg-gray-50 mb-4">
          {messages.length === 0 && (
            <div className="text-gray-400 text-center mt-32">Нет сообщений</div>
          )}
          {messages.map(msg => (
            <div key={msg.id} className={`mb-3 ${msg.isAdmin ? 'text-left' : 'text-right'}`}>
              <div
                className={`inline-block max-w-[85%] px-3 py-2 rounded-lg text-sm break-words whitespace-normal ${
                  msg.isAdmin ? 'bg-gray-200 text-gray-800' : 'bg-blue-600 text-white'
                }`}
              >
                {msg.content}
                <div className="text-xs opacity-70 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ваш вопрос..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
            disabled={loading}
          />
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            Отправить
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default SupportPage;