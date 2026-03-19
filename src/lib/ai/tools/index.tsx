import { SiDungeonsanddragons } from '@icons-pack/react-simple-icons';
import { Globe } from 'lucide-react';
import { createDndTools } from './dnd';
import { createWebSearchTools } from './web_search';

/**
 * A mapping of custom tool names to their configurations.
 * Each key in the mapping corresponds to a custom tool name.
 * The value associated with each key is an object containing
 * information about the custom tool, such as its name, description,
 * icon, and creation function.
 * The `replacePrompt` property is a boolean indicating whether
 * the tool should replace the system prompt with its own prompt
 * when activated or add to it.
 */
export const TOOL_CONFIG = {
  DND: {
    name: 'D&D Mode',
    description: 'Allows the AI to access D&D content and rules.',
    value: 'dnd',
    icon: <SiDungeonsanddragons className='size-4' />,
    create: createDndTools,
  },
  WEB_SEARCH: {
    name: 'Web Search',
    description: 'Allows the AI to search the web for information. (Experimental)',
    value: 'web_search',
    icon: <Globe className='size-4' />,
    create: createWebSearchTools,
  },
} as const;

// Derive enum-like structure from TOOL_CONFIG because actual enums are shit
const toolKeys = Object.keys(TOOL_CONFIG) as Array<keyof typeof TOOL_CONFIG>;
export const CustomTool = toolKeys.reduce(
  (acc, key) => {
    acc[key] = TOOL_CONFIG[key].value;
    return acc;
  },
  {} as Record<keyof typeof TOOL_CONFIG, (typeof TOOL_CONFIG)[keyof typeof TOOL_CONFIG]['value']>,
) as {
  readonly [K in keyof typeof TOOL_CONFIG]: (typeof TOOL_CONFIG)[K]['value'];
};
export type CustomTool = (typeof CustomTool)[keyof typeof CustomTool];
export type CustomTools = CustomTool[];
