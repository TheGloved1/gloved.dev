import { Message } from '@/lib/dexie';
const temperature = 0.95;
const maxTokens = 4096;
const frequencyPenalty = 0.95;
const presencePenalty = 0.15;

export const modelConfig = {
  temperature,
  maxTokens,
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

export const Models = [
  {
    label: 'Gemini 2.0 Flash',
    value: 'gemini-2.0-flash',
    provider: 'google',
    enabled: true,
    description:
      "Google's flagship AI model, optimized for speed and efficiency while maintaining high performance in various tasks",
    reasoning: false,
    requirements: {
      loggedin: false,
      admin: false,
    },
  } as const,
  {
    label: 'Gemini 2.0 Flash Lite',
    value: 'gemini-2.0-flash-lite',
    provider: 'google',
    enabled: true,
    description: 'A lightweight version of Gemini 2.0 Flash, designed for faster responses and lower resource usage',
    reasoning: false,
    requirements: {
      loggedin: false,
      admin: false,
    },
  } as const,
  {
    label: 'Gemini 2.0 Pro Experimental',
    value: 'gemini-2.0-pro-exp-02-05',
    provider: 'google',
    enabled: false,
    description: 'An experimental version of Gemini with enhanced capabilities for advanced reasoning and complex tasks',
    reasoning: false,
    requirements: {
      loggedin: false,
      admin: false,
    },
  } as const,
  {
    label: 'Gemini 2.5 Pro Experimental',
    value: 'gemini-2.5-pro-exp-03-25',
    provider: 'google',
    enabled: true,
    description:
      "Google's state-of-the-art thinking model, capable of reasoning over complex problems in code, math, and STEM, as well as analyzing large datasets, codebases, and documents using long context.",
    reasoning: false,
    requirements: {
      loggedin: false,
      admin: false,
    },
  } as const,
  {
    label: 'Qwen Coder-32b',
    value: 'qwen-2.5-coder-32b',
    provider: 'groq',
    enabled: false,
    description:
      'Specialized code generation model with production-quality code output, trained on 5.5 trillion tokens of code and technical content',
    reasoning: false,
    requirements: {
      loggedin: false,
      admin: false,
    },
  } as const,
  {
    label: 'Qwen qwq-32b',
    value: 'qwen-qwq-32b',
    provider: 'groq',
    enabled: false,
    description:
      'Advanced reasoning model delivering performance comparable to state-of-the-art models 20x larger, excelling in complex reasoning tasks',
    reasoning: false,
    requirements: {
      loggedin: false,
      admin: false,
    },
  } as const,
  {
    label: 'Llama 4 Scout',
    value: 'meta-llama/llama-4-scout-17b-16e-instruct',
    provider: 'groq',
    enabled: false,
    description: 'A specialized model for reasoning tasks, optimized for speed and accuracy',
    reasoning: false,
    requirements: {
      loggedin: false,
      admin: false,
    },
  } as const,
  {
    label: 'Llama 3.1-8b',
    value: 'llama-3.1-8b-instant',
    provider: 'groq',
    enabled: false,
    description: 'Lightweight version of Llama 3 optimized for fast responses and efficient inference',
    reasoning: false,
    requirements: {
      loggedin: false,
      admin: false,
    },
  } as const,
  {
    label: 'Llama 3.3-70b',
    value: 'llama-3.3-70b-versatile',
    provider: 'groq',
    enabled: false,
    description: 'Large-scale Llama model with versatile capabilities across various AI tasks',
    reasoning: false,
    requirements: {
      loggedin: false,
      admin: false,
    },
  } as const,
  {
    label: 'Deepseek R1 (Qwen Distill)',
    value: 'deepseek-r1-distill-qwen-32b',
    provider: 'groq',
    enabled: true,
    description: 'Distilled version of DeepSeek R1, optimized for high performance reasoning tasks using Qwen architecture',
    reasoning: false,
    requirements: {
      loggedin: false,
      admin: false,
    },
  } as const,
  {
    label: 'Deepseek R1 (Llama Distill)',
    value: 'deepseek-r1-distill-llama-70b',
    provider: 'groq',
    enabled: true,
    description: 'Distilled version of DeepSeek R1, fine-tuned from Llama-3.3-70B for robust reasoning capabilities',
    reasoning: true,
    requirements: {
      loggedin: false,
      admin: false,
    },
  } as const,
  {
    label: 'OpenRouter Auto',
    value: 'openrouter/auto',
    provider: 'openrouter',
    enabled: true,
    description: 'A model will be selected based on your prompt',
    reasoning: false,
    requirements: {
      loggedin: true,
      admin: true,
    },
  } as const,
] as const;

export type ModelID = (typeof Models)[number]['value'];
export const ModelList = Models.map((m) => m.value);

export const defaultModel = 'gemini-2.0-flash' as const;

export type ChatFetchOptions = { model?: ModelID; system?: string; messages: Message[] };
