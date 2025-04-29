import { defaultModel, ModelID } from '@/lib/ai';
import { useLocalStorage } from './use-local-storage';

/**
 * React hook to get/set the chat options. The options are stored in local storage,
 * so they will persist across page reloads.
 *
 * @returns An object with the following properties:
 *   - toolsEnabled: A boolean indicating whether or not to enable the tools.
 *   - setToolsEnabled: A function to set the value of toolsEnabled.
 *   - syncEnabled: A boolean indicating whether or not to enable syncing.
 *   - setSyncEnabled: A function to set the value of syncEnabled.
 *   - systemPrompt: An optional string with the system prompt.
 *   - setSystemPrompt: A function to set the value of systemPrompt.
 *   - model: The model to use for generating the response.
 *   - setModel: A function to set the value of model.
 */
export function useChatOptions() {
  const [toolsEnabled, setToolsEnabled] = useLocalStorage('toolsEnabled', false);
  const [syncEnabled, setSyncEnabled] = useLocalStorage('syncEnabled', false);
  const [systemPrompt, setSystemPrompt] = useLocalStorage<string | undefined>('systemPrompt', undefined);
  const [model, setModel] = useLocalStorage<ModelID>('model', defaultModel);

  return { toolsEnabled, setToolsEnabled, syncEnabled, setSyncEnabled, systemPrompt, setSystemPrompt, model, setModel };
}

/**
 * Get the current chat options from local storage.
 *
 * @returns An object with the following properties:
 *   - toolsEnabled: A boolean indicating whether or not to enable the tools.
 *   - syncEnabled: A boolean indicating whether or not to enable syncing.
 *   - systemPrompt: An optional string with the system prompt.
 *   - model: The model to use for generating the response.
 */
export function getChatOptions() {
  const toolsEnabled = localStorage.getItem('toolsEnabled') === 'true';
  const syncEnabled = localStorage.getItem('syncEnabled') === 'true';
  const systemPrompt = localStorage.getItem('systemPrompt')?.trim();
  const model = (localStorage.getItem('model') || defaultModel) as ModelID;
  return { toolsEnabled, syncEnabled, systemPrompt, model };
}
