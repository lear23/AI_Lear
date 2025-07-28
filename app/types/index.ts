export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
  isFileOperation?: boolean;
};


export type ChatHeaderProps = {
  workingDirectory: string;
  isLoading: boolean;
  onClear: () => void;
  onToggleCommands: () => void;
  showCommands: boolean;
  hasMessages: boolean;
};