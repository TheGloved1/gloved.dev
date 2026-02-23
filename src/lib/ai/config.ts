import { Message } from '@/lib/dexie';
import { ModelID } from './models';
const temperature = 0.95;
const maxOutputTokens = 4096;
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

export type ChatFetchOptions = {
  model?: ModelID;
  system?: string;
  messages: Message[];
};
