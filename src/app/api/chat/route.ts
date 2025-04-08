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
  LanguageModelV1,
  smoothStream,
  streamText,
  wrapLanguageModel,
} from 'ai';

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

const LanguageModels = Constants.NewChatModels.reduce(
  (acc, { value, provider, reasoning }) => {
    if (provider === 'google') {
      acc[value] = google.languageModel(value, { safetySettings });
    } else if (provider === 'groq') {
      if (reasoning) {
        acc[value] = wrapLanguageModel({
          model: groq.languageModel(value),
          middleware: extractReasoningMiddleware({ tagName: 'think', startWithReasoning: true }),
        });
      } else {
        acc[value] = groq.languageModel(value);
      }
    }
    return acc;
  },
  {} as Record<(typeof Constants.NewChatModels)[number]['value'], LanguageModelV1>,
);

const modelProvider = customProvider({
  languageModels: LanguageModels,
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
  const system = !!parsed.system?.trim() ? parsed.system.trim() : ((await tryCatch(fetchSystemPrompt())).data ?? '');

  const coreMessages = messages.map((msg) => ({
    role: msg.role,
    content: formatMessageContent(msg.content, msg.attachments),
  })) as CoreMessage[];

  const model = modelProvider.languageModel(parsed.model ?? Constants.ChatModels.default);

  // Don't send penalties if the model is gemini-2.5-pro-exp-03-25
  const freqPenalty = parsed.model !== 'gemini-2.5-pro-exp-03-25' ? frequencyPenalty : undefined;
  const presPenalty = parsed.model !== 'gemini-2.5-pro-exp-03-25' ? presencePenalty : undefined;

  return createDataStreamResponse({
    execute: (dataStream) => {
      const result = streamText({
        system,
        model,
        messages: coreMessages,
        temperature,
        maxTokens,
        frequencyPenalty: freqPenalty,
        presencePenalty: presPenalty,
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
