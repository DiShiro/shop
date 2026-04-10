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

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/support/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Ошибка загрузки пользователей', err);
      setError('Не удалось загрузить список обращений');
    }
  };

  const fetchMessagesForUser = async (userId) => {
    try {
      const res = await axios.get('http://localhost:3000/api/support/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedUsers = res.data;
      setUsers(updatedUsers);
      const updatedSelected = updatedUsers.find(u => u.id === userId);
      if (updatedSelected) {
        setSelectedUser(updatedSelected);
        setMessages(updatedSelected.supportMessages);
      }
    } catch (err) {
      console.error('Ошибка обновления сообщений', err);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  useEffect(() => {
    if (selectedUser) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        fetchMessagesForUser(selectedUser.id);
      }, 3000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [selectedUser]);

  const selectUser = (userData) => {
    setSelectedUser(userData);
    setMessages(userData.supportMessages);
    setError('');
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedUser) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:3000/api/support/admin/reply',
        { userId: selectedUser.id, content: replyText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newMessage = res.data;
      setMessages(prev => [...prev, newMessage]);
      // Обновляем сообщения в users
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === selectedUser.id
            ? { ...u, supportMessages: [...u.supportMessages, newMessage] }
            : u
        )
      );
      setReplyText('');
    } catch (err) {
      console.error(err);
      setError('Не удалось отправить ответ');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return <div className="container mx-auto px-4 py-8">Доступ запрещён</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Панель поддержки (админ)</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <div className="flex gap-6 flex-wrap">
        <div className="w-full md:w-1/3 bg-white rounded-xl shadow-md p-4">
          <h2 className="font-semibold mb-2">Обращения пользователей</h2>
          {users.length === 0 && <div className="text-gray-400">Нет обращений</div>}
          {users.map(u => (
            <div
              key={u.id}
              onClick={() => selectUser(u)}
              className={`p-2 cursor-pointer border-b hover:bg-gray-100 ${
                selectedUser?.id === u.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="font-medium">{u.username}</div>
              <div className="text-sm text-gray-500 truncate">
                {u.supportMessages[u.supportMessages.length - 1]?.content || 'Нет сообщений'}
              </div>
            </div>
          ))}
        </div>
        <div className="w-full md:w-2/3 bg-white rounded-xl shadow-md p-4">
          {selectedUser ? (
            <>
              <h2 className="font-semibold mb-2">Чат с {selectedUser.username}</h2>
              <div className="border rounded-lg h-96 overflow-y-auto p-3 bg-gray-50 mb-3">
                {messages.length === 0 && (
                  <div className="text-gray-400 text-center mt-32">Нет сообщений</div>
                )}
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`mb-2 ${msg.isAdmin ? 'text-left' : 'text-right'}`}
                  >
                    <div
                      className={`inline-block px-3 py-1 rounded-lg ${
                        msg.isAdmin ? 'bg-gray-200 text-gray-800' : 'bg-blue-600 text-white'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(msg.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendReply} className="flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Ответ..."
                  className="flex-1 border rounded-lg px-3 py-2"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !replyText.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Отправка...' : 'Отправить'}
                </button>
              </form>
              <div className="text-xs text-gray-400 mt-2 text-right">
                Автообновление каждые 5 секунд
              </div>
            </>
          ) : (
            <div className="text-gray-400 text-center mt-32">Выберите пользователя</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupportPage;