export default function MessageBubble({ text, fromMe }) {
  return (
    <div className={`p-2 m-1 rounded ${fromMe ? 'bg-blue-500 text-white self-end' : 'bg-gray-300 self-start'}`}>
      {text}
    </div>
  );
}
