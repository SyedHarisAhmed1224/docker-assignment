import { useState } from 'react';

export default function MessageInput({ onSend }) {
  const [text, setText] = useState('');
  const send = () => {
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };

  return (
    <div className="flex p-2">
      <input
        className="flex-grow border rounded p-2"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && send()}
      />
      <button onClick={send} className="ml-2 px-4 py-2 bg-blue-600 text-white rounded">Send</button>
    </div>
  );
}
