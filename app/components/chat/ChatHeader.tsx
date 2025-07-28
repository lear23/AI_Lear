import { CodeIcon } from '@radix-ui/react-icons';

type ChatHeaderProps = {
  workingDirectory: string;
  isLoading: boolean;
  onClear: () => void;
  onToggleCommands: () => void;
  showCommands: boolean;
  hasMessages: boolean;
};

export const ChatHeader = ({
  workingDirectory,
  isLoading,
  onClear,
  onToggleCommands,
  hasMessages,
}: ChatHeaderProps) => (
  <header className="border-b border-slate-700 bg-slate-800">
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-semibold text-white">QueenSeek Chat</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleCommands}
            className="flex items-center space-x-2 text-sm text-slate-400 hover:text-slate-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4 17l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="12" y="19" width="8" height="2" rx="1" />
            </svg>
            <span>Comandos</span>
          </button>
          {hasMessages && (
            <button onClick={onClear} className="text-sm text-slate-400 hover:text-slate-200">
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

      <div className="flex items-center space-x-2 text-xs text-slate-400">
        <CodeIcon className="w-3 h-3" />
        <span>Directorio: {workingDirectory}</span>
      </div>
    </div>
  </header>
);
