import { Message } from '@/lib/dexie';
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

export type ModelType = 'gemini' | 'qwen' | 'llama' | 'deepseek' | 'gpt';
export const modelTypes = ['gemini', 'qwen', 'llama', 'deepseek', 'gpt'] as const;

export type Tools = ('fileTools' | 'searchTool')[];

export type Features = 'reasoning'[];

export const Models = Object.freeze([
  {
    label: 'Gemini 2.0 Flash',
    value: 'gemini-2.0-flash',
    provider: 'google',
    type: 'gemini',
    enabled: true,
    description: "Google's latest stable model",
    requirements: {
      loggedIn: false,
      admin: false,
    },
    tools: [] as Tools,
    features: [] as Features,
  },
  {
    label: 'Gemini 2.0 Flash Lite',
    value: 'gemini-2.0-flash-lite',
    provider: 'google',
    type: 'gemini',
    enabled: true,
    description: 'Faster, less precise Gemini model',
    requirements: {
      loggedIn: false,
      admin: false,
    },
    tools: [] as Tools,
    features: [] as Features,
  },
  {
    label: 'Gemini 2.5 Flash (Preview)',
    value: 'gemini-2.5-flash-preview-04-17',
    provider: 'google',
    type: 'gemini',
    enabled: true,
    description: "Google's latest experimental fast model",
    requirements: {
      loggedIn: true,
      admin: true,
    },
    tools: [] as Tools,
    features: [] as Features,
  },
  {
    label: 'Gemini 2.5 Pro (Experimental)',
    value: 'gemini-2.5-pro-exp-03-25',
    provider: 'google',
    type: 'gemini',
    enabled: true,
    description: "Google's latest experimental thinking model",
    requirements: {
      loggedIn: true,
      admin: true,
    },
    tools: [] as Tools,
    features: [] as Features,
  },
  {
    label: 'Qwen Coder-32b',
    value: 'qwen-2.5-coder-32b',
    provider: 'groq',
    type: 'qwen',
    enabled: true,
    description: 'Specialized code generation model with production-quality code output',
    requirements: {
      loggedIn: true,
      admin: true,
    },
    tools: [] as Tools,
    features: [] as Features,
  },
  {
    label: 'Qwen qwq-32b',
    value: 'qwen-qwq-32b',
    provider: 'groq',
    type: 'qwen',
    enabled: true,
    description: 'Small but mighty reasoning model',
    requirements: {
      loggedIn: true,
      admin: true,
    },
    tools: [] as Tools,
    features: ['reasoning'] as Features,
  },
  {
    label: 'Llama 4 Scout',
    value: 'meta-llama/llama-4-scout-17b-16e-instruct',
    provider: 'groq',
    type: 'llama',
    enabled: true,
    description: 'Latest open-source model from Meta',
    requirements: {
      loggedIn: false,
      admin: false,
    },
    tools: [] as Tools,
    features: ['reasoning'] as Features,
  },
  {
    label: 'Llama 4 Maverick',
    value: 'meta-llama/llama-4-maverick-17b-128e-instruct',
    provider: 'groq',
    type: 'llama',
    enabled: true,
    description: 'Latest open-source model from Meta. Limited to small conversations',
    requirements: {
      loggedIn: true,
      admin: true,
    },
    tools: [] as Tools,
    features: ['reasoning'] as Features,
  },
  {
    label: 'Llama 3.1-8b',
    value: 'llama-3.1-8b-instant',
    provider: 'groq',
    type: 'llama',
    enabled: true,
    description: 'Lightweight version of Llama 3 optimized for fast responses and efficient inference',
    requirements: {
      loggedIn: true,
      admin: true,
    },
    tools: [] as Tools,
    features: ['reasoning'] as Features,
  },
  {
    label: 'Llama 3.3-70b',
    value: 'llama-3.3-70b-versatile',
    provider: 'groq',
    type: 'llama',
    enabled: true,
    description: 'Fast, but not the smartest',
    requirements: {
      loggedIn: true,
      admin: true,
    },
    tools: [] as Tools,
    features: ['reasoning'] as Features,
  },
  {
    label: 'Deepseek R1 (Qwen Distill)',
    value: 'deepseek-r1-distill-qwen-32b',
    provider: 'groq',
    type: 'qwen',
    enabled: true,
    description: 'DeepSeek R1, distilled on Qwen 32b',
    requirements: {
      loggedIn: true,
      admin: true,
    },
    tools: [] as Tools,
    features: [] as Features,
  },
  {
    label: 'Deepseek R1 (Llama Distill)',
    value: 'deepseek-r1-distill-llama-70b',
    provider: 'groq',
    type: 'llama',
    enabled: true,
    description: 'DeepSeek R1, distilled on Llama 3.3 70b',
    requirements: {
      loggedIn: false,
      admin: false,
    },
    tools: [] as Tools,
    features: ['reasoning'] as Features,
  },
  {
    label: 'Groq Compound (Beta)',
    value: 'compound-beta',
    provider: 'groq',
    type: 'compound',
    enabled: true,
    description: 'Compound-beta is a compound AI system powered by multiple openly available models',
    requirements: {
      loggedIn: true,
      admin: true,
    },
    tools: [] as Tools,
    features: [] as Features,
  },
] as const);

export type ModelID = (typeof Models)[number]['value'];
export type Model = (typeof Models)[number];
export const ModelList = Models.map((m) => m.value);

export const defaultModel = 'gemini-2.0-flash-lite' as const;

export type ChatFetchOptions = {
  model?: ModelID;
  system?: string;
  messages: Message[];
};
