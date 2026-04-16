import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AdminSupportPage = () => {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const intervalRef = useRef(null);
  const messagesEndRef = useRef(null);

  const fetchUsers = async () => {
    if (!token) return;
    try {
      const res = await axios.get('http://localhost:3000/api/support/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      setError('Ошибка загрузки пользователей');
    }
  };

  const fetchMessages = async (userId) => {
    if (!token) return;
    try {
      const res = await axios.get(`http://localhost:3000/api/support/messages/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data.messages || []);
    } catch (err) {
      setError('Ошибка загрузки сообщений');
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchUsers();
  }, [user]);

  const selectUser = (u) => {
    setSelectedUser(u);
    fetchMessages(u.id);
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedUser) return;
    setLoading(true);
    try {
      await axios.post('http://localhost:3000/api/support/admin/reply',
        { userId: selectedUser.id, content: replyText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReplyText('');
      await fetchMessages(selectedUser.id);
      await fetchUsers();
    } catch (err) {
      setError('Ошибка отправки');
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    if (!selectedUser) return;
    if (!window.confirm(`Удалить всю переписку с ${selectedUser.username}?`)) return;
    try {
      await axios.delete(`http://localhost:3000/api/support/admin/messages/${selectedUser.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages([]);
      await fetchUsers();
      setSelectedUser(prev => prev ? { ...prev, supportMessages: [] } : null);
    } catch (err) {
      setError('Не удалось удалить чат');
    }
  };

  useEffect(() => {
    if (selectedUser) {
      const id = setInterval(() => fetchMessages(selectedUser.id), 4000);
      return () => clearInterval(id);
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user || user.role !== 'admin') {
    return <div className="container mx-auto px-4 py-8">Доступ запрещён</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-4">
      <h1 className="text-lg font-bold mb-3">Панель поддержки</h1>
      {error && <div className="mb-2 text-red-600 text-xs">{error}</div>}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Список пользователей */}
        <div className="w-full md:w-1/3 bg-white rounded-md shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-3 py-2 border-b">
            <h2 className="font-medium text-sm">Обращения</h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {users.length === 0 && <div className="p-3 text-gray-400 text-xs text-center">Нет обращений</div>}
            {users.map(u => (
              <div
                key={u.id}
                onClick={() => selectUser(u)}
                className={`p-2 cursor-pointer transition-colors ${selectedUser?.id === u.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
              >
                <div className="font-medium text-sm text-gray-800">{u.username}</div>
                <div className="text-xs text-gray-500 truncate">
                  {u.supportMessages[u.supportMessages.length - 1]?.content || 'Нет сообщений'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full md:w-2/3 bg-white rounded-md shadow-sm flex flex-col">
          {selectedUser ? (
            <>
              <div className="bg-gray-50 px-3 py-2 border-b rounded-t-md flex justify-between items-center">
                <h2 className="font-medium text-sm">Чат с {selectedUser.username}</h2>
                <button onClick={clearChat} className="text-red-500 hover:text-red-700 text-sm">🗑️</button>
              </div>
              <div className="overflow-y-auto p-2 bg-gray-50 space-y-2" style={{ height: '500px' }}>
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] px-2 py-1 rounded-lg text-xs break-words whitespace-normal ${
                        msg.isAdmin ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      {msg.content}
                      <div className="text-[10px] opacity-70 mt-0.5">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </div>
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
                <button type="submit" disabled={loading || !replyText.trim()} className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full hover:bg-blue-700">
                  {loading ? '...' : 'Отпр.'}
                </button>
              </form>
              <div className="text-[10px] text-gray-400 text-right px-2 pb-1">Обновление каждые 4 сек</div>
            </>
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-400 text-xs">Выберите пользователя</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupportPage;