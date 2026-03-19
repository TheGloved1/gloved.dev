import { CustomTools, defaultModel, ModelID, ModelList } from '@/lib/ai';
import { useLocalStorage } from './use-local-storage';
import { useMount } from './use-mount';

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
  const [model, setModel] = useLocalStorage<ModelID>('model', defaultModel);
  const [tools, setTools] = useLocalStorage<CustomTools | undefined>('tools', undefined);

  useMount(() => {
    if (!isValidModel(model)) {
      console.log('[CHAT] Invalid model, setting to default');
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
    tools,
    setTools,
  };
}
