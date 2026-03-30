import React, { useState, useRef, useEffect } from 'react';

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const botMsg = { text: 'Спасибо за сообщение! Мы ответим вам в ближайшее время.', sender: 'bot' };
      setMessages(prev => [...prev, botMsg]);
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 bg-blue-600 text-white p-3 rounded-full shadow-md hover:bg-blue-700 transition z-50 text-lg border border-gray-700"
      >
        💬
      </button>
      {isOpen && (
        <div className="fixed bottom-16 right-5 w-72 bg-white rounded-lg shadow-lg border border-gray-400 z-50 flex flex-col">
          <div className="bg-blue-600 text-white p-2 rounded-t-lg flex justify-between items-center text-sm border-b border-gray-300">
            <span>Техподдержка</span>
            <button onClick={() => setIsOpen(false)} className="hover:text-gray-200">✕</button>
          </div>
          <div className="h-80 overflow-y-auto p-2 flex flex-col space-y-1.5 text-sm">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-2 py-1 rounded-lg ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 border border-gray-300'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-gray-400 text-xs">Печатает...</div>}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendMessage} className="border-t border-gray-300 p-2 flex gap-1 items-center bg-white">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Напишите..."
              className="flex-1 border border-gray-400 rounded-full px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white text-sm rounded-full px-3 py-1 hover:bg-blue-700 transition disabled:opacity-50 border border-gray-700"
            >
              Отпр.
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chat;