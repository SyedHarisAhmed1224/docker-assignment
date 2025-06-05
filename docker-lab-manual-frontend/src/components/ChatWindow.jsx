import { useEffect, useState, useRef } from 'react';
import socket from '../services/socket';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();

  useEffect(() => {
    socket.on('chat message', msg => {
      setMessages(prev => [...prev, msg]);
    });

    return () => socket.off('chat message');
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text) => {
    const msg = { text, fromMe: true };
    setMessages(prev => [...prev, msg]);
    socket.emit('chat message', msg);
  };

  return (
    <div className="flex flex-col h-screen p-4">
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((msg, i) => (
          <MessageBubble key={i} {...msg} />
        ))}
        <div ref={scrollRef}></div>
      </div>
      <MessageInput onSend={handleSend} />
    </div>
  );
}
