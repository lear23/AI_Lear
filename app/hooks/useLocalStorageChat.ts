import { useEffect } from 'react';
import { ChatMessage } from '../types';


export const useLocalStorageChat = (
  chatHistory: ChatMessage[],
  setChatHistory: (val: ChatMessage[]) => void,
  workingDirectory: string,
  setWorkingDirectory: (val: string) => void
) => {
  useEffect(() => {
    const savedChat = localStorage.getItem('chatHistory');
    const savedDir = localStorage.getItem('workingDirectory');

    if (savedChat) {
      try {
        const parsedChat = JSON.parse(savedChat);
        if (Array.isArray(parsedChat)) setChatHistory(parsedChat);
      } catch {
        console.warn('Invalid chat history format');
      }
    }

    if (savedDir) setWorkingDirectory(savedDir);
  }, []);

  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  useEffect(() => {
    localStorage.setItem('workingDirectory', workingDirectory);
  }, [workingDirectory]);
};
