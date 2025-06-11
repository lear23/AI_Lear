'use client';

import { useState } from 'react';

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ message: string; response: string }[]>([]);

  const sendMessage = async () => {
    if (!message.trim()) return;

   
    setChatHistory((prev) => [...prev, { message, response: 'Cargando...' }]);

    // Enviar mensaje al backend
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();

    if (data.error) {
      setChatHistory((prev) => [...prev, { message, response: `Error: ${data.error}` }]);
    } else {
      setChatHistory((prev) => [...prev, { message, response: data.response }]);
    }

    setMessage('');
  };

  return (
    <div style={{ width: '100%', maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', height: '300px', overflowY: 'scroll' }}>
        {chatHistory.map((chat, index) => (
          <div key={index} style={{ marginBottom: '15px' }}>
            <strong>User:</strong>
            <p style={{ display: 'inline-block', marginLeft: '5px' }}>{chat.message}</p>
            <br />
            <strong>DeepSeek:</strong>
            <p style={{ display: 'inline-block', marginLeft: '5px' }}>{chat.response}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ width: '100%', color:"black", padding: '10px', fontSize: '14px', marginBottom: '10px' }}
          placeholder="Escribe un mensaje..."
        />
        <button
          onClick={sendMessage}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            borderRadius: '5px',
          }}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}