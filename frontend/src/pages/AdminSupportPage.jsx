import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AdminSupportPage = () => {
  const { user, token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const intervalRef = useRef(null);
  const messagesEndRef = useRef(null);

  const fetchTickets = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/support/admin/tickets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(res.data);
    } catch (err) {
      setError('Ошибка загрузки тикетов');
    }
  };

  const fetchTicketDetails = async (ticketId) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/support/admin/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedTicket(res.data);
      setMessages(res.data.messages);
    } catch (err) {
      setError('Ошибка загрузки сообщений');
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchTickets();
  }, [user]);

  useEffect(() => {
    if (selectedTicket) {
      intervalRef.current = setInterval(() => fetchTicketDetails(selectedTicket.id), 4000);
      return () => clearInterval(intervalRef.current);
    }
  }, [selectedTicket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    setLoading(true);
    try {
      await axios.post(
        `http://localhost:3000/api/support/admin/tickets/${selectedTicket.id}/reply`,
        { content: replyText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReplyText('');
      await fetchTicketDetails(selectedTicket.id);
      await fetchTickets();
    } catch (err) {
      setError('Ошибка отправки');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    if (!selectedTicket) return;
    try {
      await axios.patch(
        `http://localhost:3000/api/support/admin/tickets/${selectedTicket.id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchTicketDetails(selectedTicket.id);
      await fetchTickets();
    } catch (err) {
      setError('Ошибка изменения статуса');
    }
  };

  if (!user || user.role !== 'admin') {
    return <div className="container mx-auto px-4 py-8">Доступ запрещён</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-4">
      <h1 className="text-lg font-bold mb-3">Панель поддержки (админ)</h1>
      {error && <div className="mb-2 text-red-600 text-xs">{error}</div>}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="w-full md:w-1/3 bg-white rounded-md shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-3 py-2 border-b">
            <h2 className="font-medium text-sm">Обращения</h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {tickets.length === 0 && <div className="p-3 text-gray-400 text-xs text-center">Нет тикетов</div>}
            {tickets.map(t => (
              <div
                key={t.id}
                onClick={() => fetchTicketDetails(t.id)}
                className={`p-2 cursor-pointer transition-colors ${selectedTicket?.id === t.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
              >
                <div className="font-medium text-sm text-gray-800">{t.user.username}</div>
                <div className="text-xs text-gray-500 truncate">
                  {t.messages[0]?.content || 'Нет сообщений'} — {t.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full md:w-2/3 bg-white rounded-md shadow-sm flex flex-col">
          {selectedTicket ? (
            <>
              <div className="bg-gray-50 px-3 py-2 border-b rounded-t-md flex justify-between items-center">
                <h2 className="font-medium text-sm">Чат с {selectedTicket.user.username}</h2>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => updateStatus(e.target.value)}
                  className="text-xs border rounded px-1 py-0.5"
                >
                  <option value="open">Открыт</option>
                  <option value="in_progress">В работе</option>
                  <option value="closed">Закрыт</option>
                </select>
              </div>
              <div className="overflow-y-auto p-2 bg-gray-50 space-y-2" style={{ height: '500px' }}>
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-2 py-1 rounded-lg text-xs break-words whitespace-normal ${msg.isAdmin ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                      {msg.content}
                      <div className="text-[10px] opacity-70 mt-0.5">{new Date(msg.createdAt).toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && <div className="text-gray-400 text-xs text-center mt-32">Нет сообщений</div>}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={sendReply} className="p-2 border-t bg-white flex gap-1">
                <input
                  type="text"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Ответ..."
                  className="flex-1 border border-gray-300 rounded-full px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={loading}
                />
                <button type="submit" disabled={loading || !replyText.trim()} className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                  {loading ? '...' : 'Отпр.'}
                </button>
              </form>
              <div className="text-[10px] text-gray-400 text-right px-2 pb-1">Обновление каждые 4 сек</div>
            </>
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-400 text-xs">Выберите обращение</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupportPage;