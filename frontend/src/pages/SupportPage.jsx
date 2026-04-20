import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const SupportPage = () => {
  const { user, token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const intervalRef = useRef(null);

  const fetchTickets = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/support/tickets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(res.data);
      if (res.data.length === 0) {
        const newTicket = await axios.post('http://localhost:3000/api/support/tickets', {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTickets([newTicket.data]);
        setActiveTicketId(newTicket.data.id);
      } else if (!activeTicketId) {
        setActiveTicketId(res.data[0].id);
      }
    } catch (err) {
      setError('Не удалось загрузить обращения');
    }
  };

  const fetchMessages = async (ticketId) => {
    if (!ticketId) return;
    try {
      const res = await axios.get(`http://localhost:3000/api/support/tickets/${ticketId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user && token) fetchTickets();
  }, [user, token]);

  useEffect(() => {
    if (activeTicketId) {
      fetchMessages(activeTicketId);
      intervalRef.current = setInterval(() => fetchMessages(activeTicketId), 4000);
      return () => clearInterval(intervalRef.current);
    }
  }, [activeTicketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeTicketId) return;
    setLoading(true);
    try {
      await axios.post(
        `http://localhost:3000/api/support/tickets/${activeTicketId}/messages`,
        { content: input.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInput('');
      await fetchMessages(activeTicketId);
      await fetchTickets();
    } catch (err) {
      setError('Ошибка отправки');
    } finally {
      setLoading(false);
    }
  };

  const closeTicket = async () => {
    if (!activeTicketId) return;
    try {
      await axios.patch(
        `http://localhost:3000/api/support/tickets/${activeTicketId}/close`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchTickets();
    } catch (err) {
      setError('Не удалось закрыть тикет');
    }
  };

  if (!user) return <div className="container mx-auto px-4 py-8">Войдите в аккаунт</div>;
  const activeTicket = tickets.find(t => t.id === activeTicketId);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Техподдержка</h1>
        {error && <div className="mb-2 text-red-600 text-sm">{error}</div>}
        <div className="flex gap-4 flex-wrap mb-4">
          <select
            value={activeTicketId || ''}
            onChange={(e) => setActiveTicketId(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {tickets.map(t => (
              <option key={t.id} value={t.id}>
                Обращение #{t.id} ({t.status === 'closed' ? 'закрыто' : 'открыто'})
              </option>
            ))}
          </select>
          {activeTicket && activeTicket.status !== 'closed' && (
            <button onClick={closeTicket} className="bg-gray-500 text-white px-3 py-1 rounded">
              Закрыть обращение
            </button>
          )}
        </div>
        <div className="border rounded-lg h-96 overflow-y-auto p-4 bg-gray-50 mb-4">
          {messages.length === 0 && <div className="text-gray-400 text-center mt-32">Нет сообщений</div>}
          {messages.map(msg => (
            <div key={msg.id} className={`mb-3 ${msg.isAdmin ? 'text-left' : 'text-right'}`}>
              <div className={`inline-block max-w-[85%] px-3 py-2 rounded-lg text-sm break-words whitespace-normal ${msg.isAdmin ? 'bg-gray-200 text-gray-800' : 'bg-blue-600 text-white'}`}>
                {msg.content}
                <div className="text-xs opacity-70 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        {activeTicket?.status !== 'closed' ? (
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
        ) : (
          <div className="text-gray-500 text-sm">Обращение закрыто. Новые сообщения нельзя отправить.</div>
        )}
      </div>
    </div>
  );
};

export default SupportPage;