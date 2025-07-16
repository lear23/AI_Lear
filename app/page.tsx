'use client';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Highlight, themes } from 'prism-react-renderer';
import { CopyIcon, CheckIcon, CodeIcon, FileIcon } from '@radix-ui/react-icons';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
  isFileOperation?: boolean;
};

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [workingDirectory, setWorkingDirectory] = useState('C:\\Users\\lears.ISRA\\Git-clones\\AI_Lear\\app');
  const [showCommands, setShowCommands] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Filtro mejorado para ocultar el pensamiento del agente
  const filterAgentThoughts = (content: string): string => {
    return content
      .split('\n')
      .filter(line => {
        const trimmed = line.trim().toLowerCase();
        return !(
          trimmed.startsWith('thought:') ||
          trimmed.startsWith('action:') ||
          trimmed.startsWith('observation:') ||
          trimmed.startsWith('reasoning:') ||
          trimmed.startsWith('process:') ||
          trimmed.startsWith('analysis:') ||
          trimmed.startsWith('step ') ||
          trimmed.startsWith('first,') ||
          trimmed.startsWith('next,') ||
          trimmed.startsWith('then,') ||
          trimmed.startsWith('finally,') ||
          /^\[.*\]$/.test(trimmed) ||
          /^paso \d+:/i.test(trimmed) ||
          /^etapa \d+:/i.test(trimmed) ||
          trimmed.startsWith('let me think') ||
          trimmed.startsWith('i need to') ||
          trimmed.startsWith('i should') ||
          trimmed.startsWith('i will') ||
          trimmed.startsWith('my approach') ||
          trimmed.includes('thinking about') ||
          trimmed.includes('analyzing') ||
          /^(considering|evaluating|examining)/i.test(trimmed)
        );
      })
      .join('\n')
      .replace(/^(Muy bien|Perfecto|Excelente|Entiendo),?\s*/gm, '')
      .replace(/\*\*Análisis:\*\*.*?\n\n/gs, '')
      .replace(/\*\*Proceso:\*\*.*?\n\n/gs, '')
      .replace(/\*\*Pensamiento:\*\*.*?\n\n/gs, '')
      .replace(/```thinking[\s\S]*?```/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  // Cargar historial del localStorage
  useEffect(() => {
    const savedChat = localStorage.getItem('chatHistory');
    const savedDir = localStorage.getItem('workingDirectory');
    
    if (savedChat) {
      try {
        const parsedChat = JSON.parse(savedChat);
        if (Array.isArray(parsedChat)) {
          setChatHistory(parsedChat);
        }
      } catch (e) {
        console.error('Failed to parse chat history', e);
      }
    }
    
    if (savedDir) {
      setWorkingDirectory(savedDir);
    }
  }, []);

  // Guardar historial en localStorage
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  useEffect(() => {
    localStorage.setItem('workingDirectory', workingDirectory);
  }, [workingDirectory]);

  // Auto-scroll
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    handleResize();
  }, [message]);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: Date.now(),
      isFileOperation: message.startsWith('/')
    };
    
    const currentMessage = message;
    setMessage('');
    setIsLoading(true);
    
    // Agregar mensaje del usuario
    setChatHistory(prev => [...prev, userMessage]);
    
    try {
      // Mensaje temporal del asistente
      const assistantTempMessage: ChatMessage = {
        role: 'assistant',
        content: '...',
        timestamp: Date.now()
      };
      setChatHistory(prev => [...prev, assistantTempMessage]);
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: currentMessage,
          workingDirectory: workingDirectory,
          history: chatHistory
        }),
      });
      
      const data = await res.json();
      
      // Actualizar directorio de trabajo si cambió
      if (data.workingDirectory) {
        setWorkingDirectory(data.workingDirectory);
      }
      
      // Actualizar última respuesta
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = {
          role: 'assistant',
          content: data.error 
            ? `**Error:** ${data.error}`
            : filterAgentThoughts(data.response),
          timestamp: Date.now(),
          isFileOperation: data.isFileOperation
        };
        return newHistory;
      });
    } catch {
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = {
          role: 'assistant',
          content: '**Error:** No se pudo conectar con el servidor',
          timestamp: Date.now()
        };
        return newHistory;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    if (confirm('¿Estás seguro de que quieres borrar el historial de chat?')) {
      setChatHistory([]);
      localStorage.removeItem('chatHistory');
    }
  };

  const quickCommands = [
    { cmd: '/list', desc: 'Listar archivos' },
    { cmd: '/read ', desc: 'Leer archivo' },
    { cmd: '/write ', desc: 'Crear/editar archivo' },
    { cmd: '/delete ', desc: 'Eliminar archivo' },
    { cmd: '/mkdir ', desc: 'Crear carpeta' }
  ];

  const insertCommand = (cmd: string) => {
    setMessage(cmd);
    setShowCommands(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-xl font-semibold text-white">QueenSeek Chat</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCommands(!showCommands)}
                className="flex items-center space-x-2 text-sm text-slate-400 hover:text-slate-200"
              >
                {/* Terminal icon fallback */}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 17l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="12" y="19" width="8" height="2" rx="1" />
                </svg>
                <span>Comandos</span>
              </button>
              {chatHistory.length > 0 && (
                <button 
                  onClick={clearChat}
                  className="text-sm text-slate-400 hover:text-slate-200"
                >
                  Limpiar chat
                </button>
              )}
              {isLoading ? (
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-150"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-300"></div>
                </div>
              ) : (
                <span className="text-sm text-slate-400 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  En línea
                </span>
              )}
            </div>
          </div>
          
          {/* Working Directory */}
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <CodeIcon className="w-3 h-3" />
            <span>Directorio: {workingDirectory}</span>
          </div>
          
          {/* Commands Panel */}
          {showCommands && (
            <div className="mt-3 p-3 bg-slate-700 rounded-lg">
              <h3 className="text-sm font-medium text-slate-200 mb-2">Comandos disponibles:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {quickCommands.map((cmd) => (
                  <button
                    key={cmd.cmd}
                    onClick={() => insertCommand(cmd.cmd)}
                    className="flex items-center space-x-2 p-2 text-left text-xs bg-slate-600 hover:bg-slate-500 rounded"
                  >
                    <code className="text-blue-300">{cmd.cmd}</code>
                    <span className="text-slate-300">{cmd.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Chat Messages */}
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
              <p>💡 Usa comandos como <code className="bg-slate-700 px-1 rounded">/list</code> para gestionar archivos</p>
              <p>📁 Directorio actual: <code className="bg-slate-700 px-1 rounded">{workingDirectory}</code></p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {chatHistory.map((chat, index) => (
              <div 
                key={`${chat.role}-${chat.timestamp || index}`} 
                className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[90%] sm:max-w-[85%] rounded-lg px-4 py-3 ${
                    chat.role === 'user' 
                      ? chat.isFileOperation
                        ? 'bg-purple-600 text-white rounded-br-none'
                        : 'bg-blue-600 text-white rounded-br-none'
                      : chat.isFileOperation
                        ? 'bg-slate-700 border border-purple-500 rounded-bl-none'
                        : 'bg-slate-800 border border-slate-700 rounded-bl-none'
                  }`}
                >
                  {chat.isFileOperation && chat.role === 'user' && (
                    <div className="flex items-center space-x-2 mb-2 text-xs opacity-75">
                      <FileIcon className="w-3 h-3" />
                      <span>Comando de archivo</span>
                    </div>
                  )}
                  
                  {chat.role === 'assistant' ? (
                    <div className="prose prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ className, children }) {
                            const language = className?.replace('language-', '') || '';
                            const codeString =
                              typeof children === 'string'
                                ? children
                                : Array.isArray(children)
                                ? children.join('')
                                : '';
                            
                            if (language) {
                              return (
                                <div className="relative my-2 rounded-md overflow-hidden">
                                  <div className="flex justify-between items-center bg-slate-900 text-slate-100 px-2 py-1 text-xs">
                                    <span>{language}</span>
                                    <button
                                      onClick={() => copyToClipboard(codeString)}
                                      className="flex items-center gap-1 p-1 rounded hover:bg-slate-700"
                                      title="Copiar código"
                                    >
                                      {copiedCode === codeString ? (
                                        <CheckIcon className="w-3 h-3 text-green-400" />
                                      ) : (
                                        <CopyIcon className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                  <Highlight 
                                    code={codeString.trim()} 
                                    language={language as any} 
                                    theme={themes.vsDark}
                                  >
                                    {({ className, style, tokens, getLineProps, getTokenProps }) => (
                                      <pre 
                                        className={className} 
                                        style={{ 
                                          ...style, 
                                          margin: 0,
                                          padding: '0.5rem 1rem',
                                          overflowX: 'auto'
                                        }}
                                      >
                                        {tokens.map((line, i) => (
                                          <div key={i} {...getLineProps({ line })}>
                                            {line.map((token, key) => (
                                              <span key={key} {...getTokenProps({ token })} />
                                            ))}
                                          </div>
                                        ))}
                                      </pre>
                                    )}
                                  </Highlight>
                                </div>
                              );
                            }
                            
                            return (
                              <code className="bg-slate-700 rounded px-1 py-0.5 text-sm font-mono">
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {chat.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{chat.content}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="border-t border-slate-700 bg-slate-800 py-4 px-2 sm:px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full p-3 pr-12 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-slate-700 text-white placeholder-slate-400"
                placeholder="Escribe un mensaje o usa comandos como /list, /read archivo.txt..."
                disabled={isLoading}
                rows={1}
                style={{ minHeight: '44px', maxHeight: '200px' }}
              />
              <button
                onClick={() => setMessage('')}
                className={`absolute right-12 bottom-3 p-1 rounded-full text-slate-400 hover:text-slate-200 ${
                  !message && 'hidden'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <button
              onClick={sendMessage}
              disabled={isLoading || !message.trim()}
              className="p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">
            QueenSeek puede gestionar archivos y ayudarte con programación. Usa comandos como /list para explorar archivos.
          </p>
        </div>
      </footer>
    </div>
  );
}