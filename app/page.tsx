'use client';

import { useState, useRef } from 'react';
import { ChatMessage } from './types';
import { useLocalStorageChat } from './hooks/useLocalStorageChat';
import { useAutoScroll } from './hooks/useAutoScroll';
import { filterAgentThoughts } from './utils/filterAgentThoughts';

import { ChatHeader } from './components/chat/ChatHeader';
import { ChatMessageList } from './components/chat/ChatMessageList';
import { ChatInput } from './components/chat/ChatInput';

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [workingDirectory, setWorkingDirectory] = useState('C:\\agent-workspace');
  const [showCommands, setShowCommands] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null!); // 👈 corregido con non-null assertion

  // hooks personalizados
  useLocalStorageChat(chatHistory, setChatHistory, workingDirectory, setWorkingDirectory);
  useAutoScroll(scrollRef, [chatHistory]);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: Date.now(),
      isFileOperation: message.startsWith('/'),
    };

    const currentMessage = message;
    setMessage('');
    setIsLoading(true);
    setChatHistory(prev => [...prev, userMessage, { role: 'assistant', content: '...', timestamp: Date.now() }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentMessage,
          workingDirectory,
          history: chatHistory,
        }),
      });

      const data = await res.json();

      if (data.workingDirectory) {
        setWorkingDirectory(data.workingDirectory);
      }

      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = {
          role: 'assistant',
          content: data.error ? `**Error:** ${data.error}` : filterAgentThoughts(data.response),
          timestamp: Date.now(),
          isFileOperation: data.isFileOperation,
        };
        return newHistory;
      });
    } catch {
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = {
          role: 'assistant',
          content: '**Error:** No se pudo conectar con el servidor',
          timestamp: Date.now(),
        };
        return newHistory;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm('¿Estás seguro de que quieres borrar el historial de chat?')) {
      setChatHistory([]);
      localStorage.removeItem('chatHistory');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100">
      <ChatHeader
        workingDirectory={workingDirectory}
        isLoading={isLoading}
        onClear={clearChat}
        onToggleCommands={() => setShowCommands(!showCommands)}
        showCommands={showCommands}
        hasMessages={chatHistory.length > 0}
      />

      <main className="flex-1 overflow-auto py-4 px-2 sm:px-4 max-w-6xl mx-auto w-full">
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="text-6xl mb-6">👑</div>
            <h2 className="text-2xl font-medium text-slate-300 mb-2">¡Hola! Soy QueenSeek</h2>
            <p className="text-slate-400 max-w-md mb-4">
              Soy tu asistente de programación experto. Puedo ayudarte con código, gestionar archivos,
              explicar conceptos y resolver problemas técnicos.
            </p>
            <div className="text-sm text-slate-500">
              <p>
                💡 Usa comandos como{' '}
                <code className="bg-slate-700 px-1 rounded">/list</code> para gestionar archivos
              </p>
              <p>
                📁 Directorio actual:{' '}
                <code className="bg-slate-700 px-1 rounded">{workingDirectory}</code>
              </p>
            </div>
          </div>
        ) : (
          <>
           
            <ChatMessageList chatHistory={chatHistory} scrollRef={scrollRef} />
          </>
        )}
      </main>

      <ChatInput
        message={message}
        setMessage={setMessage}
        sendMessage={sendMessage}
        isLoading={isLoading}
      />
    </div>
  );
}

