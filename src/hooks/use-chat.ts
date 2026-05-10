import { CustomTools, DEFAULT_MODEL, ModelID, ModelList } from '@/lib/ai';
import { useLocalStorage } from './use-local-storage';
import { useMount } from './use-mount';

type ThreadID = string;
type ThreadInput = {
  input: string;
  attachments: string[];
};
type InputMap = Record<ThreadID, ThreadInput>;

const EMPTY_THREAD_INPUT: ThreadInput = { input: '', attachments: [] };

function getInitialInputState(): InputMap {
  return {};
}

/**
 * Checks if a given model is valid.
 * @param model - The model to check.
 * @returns True if the model is valid, false otherwise.
 */
function isValidModel(model: string | undefined | null): model is ModelID {
  const modelId = model;
  return ModelList.includes(modelId as ModelID);
}

/**
 * A hook to store and retrieve chat options from local storage.
 * @returns An object containing the current chat options:
 *   - syncEnabled: A boolean indicating whether or not to enable syncing.
 *   - setSyncEnabled: A function to update the syncEnabled value.
 *   - systemPrompt: An optional string with the system prompt.
 *   - setSystemPrompt: A function to update the systemPrompt value.
 *   - model: The model to use for generating the response.
 *   - setModel: A function to update the model value.
 *   - tools: An optional array of custom tools.
 *   - setTools: A function to update the tools value.
 *
 * The hook returns the values of the options and the setter functions to update
 * the values.
 */
export function useChat() {
  const [syncEnabled, setSyncEnabled] = useLocalStorage('syncEnabled', false);
  const [systemPrompt, setSystemPrompt] = useLocalStorage<string | undefined>('systemPrompt', undefined);
  const [model, setModel] = useLocalStorage<ModelID>('model', DEFAULT_MODEL);
  const [tools, setTools] = useLocalStorage<CustomTools>('tools', []);

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

  useMount(() => {
    if (!isValidModel(model)) {
      console.log('[CHAT] Invalid model, setting to default');
      setModel(DEFAULT_MODEL);
    }
  });

  const clearChatSettings = () => {
    localStorage.removeItem('syncEnabled');
    localStorage.removeItem('systemPrompt');
    localStorage.removeItem('model');
    localStorage.removeItem('tools');
    localStorage.removeItem('input');
  };

  return {
    syncEnabled,
    setSyncEnabled,
    systemPrompt,
    setSystemPrompt,
    model,
    setModel,
    tools,
    setTools,
    clearChatSettings,
    getInput,
    setInput,
    clearInput,
  };
}
