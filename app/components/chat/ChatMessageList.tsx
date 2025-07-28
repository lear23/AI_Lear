'use client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Highlight, themes } from 'prism-react-renderer';
import { CopyIcon, CheckIcon, FileIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { ChatMessage } from '@/app/types';


type Props = {
  chatHistory: ChatMessage[];
  scrollRef: React.RefObject<HTMLDivElement>;
};

export const ChatMessageList = ({ chatHistory, scrollRef }: Props) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
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
                      const language : string = className?.replace('language-', '') || '';
                      const codeString = Array.isArray(children)
                        ? children.join('')
                        : (children as string);

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
                              language={language}
                              theme={themes.vsDark}
                            >
                              {({ className, style, tokens, getLineProps, getTokenProps }) => (
                                <pre
                                  className={className}
                                  style={{
                                    ...style,
                                    margin: 0,
                                    padding: '0.5rem 1rem',
                                    overflowX: 'auto',
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
                    },
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
      <div ref={scrollRef} />
    </div>
  );
};
