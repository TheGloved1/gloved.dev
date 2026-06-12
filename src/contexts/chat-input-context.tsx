'use client';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { createContext, ReactNode, useContext } from 'react';

type ThreadID = string;
type ThreadInput = { input: string; attachments: string[] };
type InputMap = Record<ThreadID, ThreadInput>;

const EMPTY_THREAD_INPUT: ThreadInput = { input: '', attachments: [] };

function getInitialInputState(): InputMap {
  return {};
}

interface ChatInputContextValue {
  getInput: (threadId: ThreadID) => ThreadInput;
  setInput: (threadId: ThreadID, updates: Partial<ThreadInput> | ((prev: ThreadInput) => Partial<ThreadInput>)) => void;
  clearInput: (threadId: ThreadID) => void;
}

const ChatInputContext = createContext<ChatInputContextValue | null>(null);

export function ChatInputProvider({ children }: { children: ReactNode }) {
  const [inputState, setInputState] = useLocalStorage<InputMap>('input', getInitialInputState());

  const getInput = (threadId: ThreadID): ThreadInput => {
    return inputState[threadId] ?? { ...EMPTY_THREAD_INPUT };
  };

  const setInput = (threadId: ThreadID, updates: Partial<ThreadInput> | ((prev: ThreadInput) => Partial<ThreadInput>)) => {
    setInputState((prevMap) => {
      const prevThread = prevMap[threadId] ?? { ...EMPTY_THREAD_INPUT };
      const partial = typeof updates === 'function' ? updates(prevThread) : updates;
      const nextThread = { ...prevThread, ...partial };
      if (nextThread.input === '' && nextThread.attachments.length === 0) {
        const next = { ...prevMap };
        delete next[threadId];
        return next;
      }
      return { ...prevMap, [threadId]: nextThread };
    });
  };

  const clearInput = (threadId: ThreadID) => {
    setInputState((prev) => {
      const next = { ...prev };
      delete next[threadId];
      return next;
    });
  };

  return <ChatInputContext.Provider value={{ getInput, setInput, clearInput }}>{children}</ChatInputContext.Provider>;
}

export function useChatInput() {
  const ctx = useContext(ChatInputContext);
  if (!ctx) {
    throw new Error('useChatInput must be used within a ChatInputProvider');
  }
  return ctx;
}
