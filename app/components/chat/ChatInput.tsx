'use client';
import { useEffect, useRef } from 'react';

type Props = {
  message: string;
  setMessage: (val: string) => void;
  sendMessage: () => void;
  isLoading: boolean;
};

export const ChatInput = ({ message, setMessage, sendMessage, isLoading }: Props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
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
            {message && (
              <button
                onClick={() => setMessage('')}
                className="absolute right-12 bottom-3 p-1 rounded-full text-slate-400 hover:text-slate-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={sendMessage}
            disabled={isLoading || !message.trim()}
            className="p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
  );
};
