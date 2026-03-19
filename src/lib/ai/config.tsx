'use client';
import { createDndTools, createWebSearchTools } from '@/lib/ai/tools';
import { SiDungeonsanddragons } from '@icons-pack/react-simple-icons';
import { Globe } from 'lucide-react';

/**
 * A constant object containing tool configuration.
 * Each tool has a name, description, value, icon, and create function.
 * The create function is used to generate the tool's functionality.
 * The value is used to select which tool to use.
 * The icon is used to display the tool's icon in the UI.
 * The name and description are used to display the tool's name and description in the UI.
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

const temperature = 0.95;
const maxOutputTokens = 4096 * 2;
const frequencyPenalty = 0.95;
const presencePenalty = 0.15;

export const modelConfig = {
  temperature,
  maxOutputTokens,
  frequencyPenalty,
  presencePenalty,
} as const;

// Safety settings for gemini models
type SafetySettings = {
  category:
    | 'HARM_CATEGORY_CIVIC_INTEGRITY'
    | 'HARM_CATEGORY_DANGEROUS_CONTENT'
    | 'HARM_CATEGORY_HARASSMENT'
    | 'HARM_CATEGORY_HATE_SPEECH'
    | 'HARM_CATEGORY_SEXUALLY_EXPLICIT'
    | 'HARM_CATEGORY_UNSPECIFIED';
  threshold: 'BLOCK_NONE';
}[];

export const safetySettings: SafetySettings = [
  {
    category: 'HARM_CATEGORY_CIVIC_INTEGRITY',
    threshold: 'BLOCK_NONE',
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_NONE',
  },
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_NONE',
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_NONE',
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_NONE',
  },
];
export const defaultModel = 'moonshotai/kimi-k2-instruct-0905' as const;
