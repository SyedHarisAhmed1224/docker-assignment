import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:3000');

function App() {
  const [username, setUsername] = useState('');
  const [user, setUser] = useState(null);
  const [receiverUsername, setReceiverUsername] = useState('');
  const [receiver, setReceiver] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);

  const handleLogin = async () => {
    const res = await axios.post('http://localhost:3000/login', { username });
    setUser(res.data.user);
  };

  const handleSelectReceiver = async () => {
    const res = await axios.post('http://localhost:3000/login', {
      username: receiverUsername,
    });
    setReceiver(res.data.user);

    // Fetch chat history
    const messagesRes = await axios.get('http://localhost:3000/messages', {
      params: {
        sender_id: user.id,
        receiver_id: res.data.user.id,
      },
    });
    setMessages(messagesRes.data);
  };

  const handleSendMessage = () => {
    const messageData = {
      sender_id: user.id,
      receiver_id: receiver.id,
      message_text: messageText,
    };
    socket.emit('send_message', messageData);
    setMessages((prev) => [...prev, { ...messageData, sent_at: new Date() }]);
    setMessageText('');
  };

  useEffect(() => {
    if (user) {
      socket.on(`receive_message_${user.id}`, (data) => {
        if (data.sender_id === receiver.id) {
          setMessages((prev) => [...prev, data]);
        }
      });
    }
    return () => {
      if (user) {
        socket.off(`receive_message_${user.id}`);
      }
    };
  }, [user, receiver]);

  if (!user) {
    return (
      <div>
        <h2>Login</h2>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

  if (!receiver) {
    return (
      <div>
        <h2>Welcome, {user.username}</h2>
        <input
          value={receiverUsername}
          onChange={(e) => setReceiverUsername(e.target.value)}
          placeholder="Enter receiver's username"
        />
        <button onClick={handleSelectReceiver}>Start Chat</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Chat with {receiver.username}</h2>
      <div style={{ border: '1px solid black', height: '300px', overflowY: 'scroll' }}>
        {messages.map((msg, idx) => (
          <div key={idx}>
            <strong>{msg.sender_id === user.id ? 'You' : receiver.username}:</strong>{' '}
            {msg.message_text}
          </div>
        ))}
      </div>
      <input
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        placeholder="Type your message"
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
}

export default App;
