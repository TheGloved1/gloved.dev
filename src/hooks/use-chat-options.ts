import { defaultModel, ModelID, ModelList } from '@/lib/ai';
import { useLocalStorage } from './use-local-storage';
import { useMount } from './use-mount';

/**
 * Checks if a given model is valid.
 * @param model - The model to check.
 * @returns True if the model is valid, false otherwise.
 */
function isValidModel(model: string | null): model is ModelID {
  return model !== null && ModelList.includes(model as ModelID);
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
 *
 * The hook returns the values of the options and the setter functions to update
 * the values.
 */
export function useChatOptions() {
  const [syncEnabled, setSyncEnabled] = useLocalStorage('syncEnabled', false);
  const [systemPrompt, setSystemPrompt] = useLocalStorage<string | undefined>('systemPrompt', undefined);
  const [model, setModel] = useLocalStorage<ModelID>('model', defaultModel);

  useMount(() => {
    if (!isValidModel(model)) {
      setModel(defaultModel);
    }
  });

  return {
    syncEnabled,
    setSyncEnabled,
    systemPrompt,
    setSystemPrompt,
    model,
    setModel,
  };
}

/**
 * Retrieves the current chat options from local storage.
 * @returns options - An object containing the current chat options.
 *   - syncEnabled: A boolean indicating whether or not to enable syncing.
 *   - systemPrompt: An optional string with the system prompt.
 *   - model: The model to use for generating the response.
 */
export function getChatOptions() {
  const syncEnabled = localStorage.getItem('syncEnabled') === 'true';
  const systemPrompt = localStorage.getItem('systemPrompt')?.trim();
  const model = localStorage.getItem('model');
  return { syncEnabled, systemPrompt, model: isValidModel(model) ? model : defaultModel };
}
