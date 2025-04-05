import { env } from '@/env';
import { fetchSystemPrompt } from '@/lib/actions';
import Constants from '@/lib/constants';
import { Message } from '@/lib/dexie';
import { formatMessageContent, tryCatch } from '@/lib/utils';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import {
  CoreMessage,
  createDataStreamResponse,
  customProvider,
  extractReasoningMiddleware,
  smoothStream,
  streamText,
  wrapLanguageModel,
} from 'ai';

export const maxDuration = 120;

const google = createGoogleGenerativeAI({ apiKey: env.GEMINI });
const groq = createGroq({ apiKey: env.GROQ });

const temperature = 0.95;
const maxTokens = 4096;
const frequencyPenalty = 0.95;
const presencePenalty = 0.15;

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

const safetySettings: SafetySettings = [
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

const GoogleModels = Constants.ChatModels.google;
const GroqModels = Constants.ChatModels.groq;

const modelProvider = customProvider({
  languageModels: {
    'gemini-2.0-flash': google.languageModel('gemini-2.0-flash', { safetySettings }),
    'gemini-2.0-flash-lite': google.languageModel('gemini-2.0-flash-lite', { safetySettings }),
    'gemini-2.0-pro-exp-02-05': google.languageModel('gemini-2.0-pro-exp-02-05', { safetySettings }),
    'qwen-2.5-coder-32b': groq.languageModel('qwen-2.5-coder-32b'),
    'qwen-qwq-32b': groq.languageModel('qwen-qwq-32b'),
    'llama-3.1-8b-instant': groq.languageModel('llama-3.1-8b-instant'),
    'llama-3.3-70b-versatile': groq.languageModel('llama-3.3-70b-versatile'),
    'deepseek-r1-distill-qwen-32b': groq.languageModel('deepseek-r1-distill-qwen-32b'),
    'deepseek-r1-distill-llama-70b': wrapLanguageModel({
      model: groq.languageModel('deepseek-r1-distill-llama-70b'),
      middleware: [extractReasoningMiddleware({ tagName: 'think' })],
    }),
  },
});

export type modelID = Parameters<(typeof modelProvider)['languageModel']>['0'];

/* function languageModel(model?: string) {
  if (!model) {
    return google.languageModel('gemini-2.0-flash', { safetySettings });
  }

  if (model in GoogleModels) {
    return google.languageModel(GoogleModels[model as keyof typeof GoogleModels], { safetySettings }) as LanguageModelV1;
  } else if (model in GroqModels) {
    if (model === 'deepseek-r1-distill-llama-70b') {
      const enhancedModel = wrapLanguageModel({
        model: groq('deepseek-r1-distill-llama-70b') as LanguageModelV1,
        middleware: [extractReasoningMiddleware({ tagName: 'think' })],
      });
      return enhancedModel;
    }
    return groq.languageModel(GroqModels[model as keyof typeof GroqModels]) as LanguageModelV1;
  }

  return google.languageModel(Constants.ChatModels.default, { safetySettings }) as LanguageModelV1;
} */

export async function POST(req: Request) {
  const parsed: { model?: modelID; system?: string; messages: Omit<Message, 'id'>[] } = await req.json();
  const { messages } = parsed;
  const system = !!parsed.system?.trim() ? parsed.system?.trim() : ((await tryCatch(fetchSystemPrompt())).data ?? '');

  const coreMessages = messages.map((msg) => ({
    role: msg.role,
    content: formatMessageContent(msg.content, msg.attachments),
  })) as CoreMessage[];

  const model = modelProvider.languageModel(parsed.model ?? Constants.ChatModels.default);

  return createDataStreamResponse({
    execute: (dataStream) => {
      const result = streamText({
        system,
        model,
        messages: coreMessages,
        temperature,
        maxTokens,
        frequencyPenalty,
        presencePenalty,
        experimental_transform: smoothStream({ delayInMs: null }),
      });
      result.mergeIntoDataStream(dataStream, { sendReasoning: true, sendSources: true, sendUsage: true });
    },
    onError: (error) => {
      // Error messages are masked by default for security reasons.
      // If you want to expose the error message to the client, you can do so here:
      return error instanceof Error ? error.message : String(error);
    },
  });
}
