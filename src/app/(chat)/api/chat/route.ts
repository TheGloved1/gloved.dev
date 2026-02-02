import { env } from '@/env';
import { fetchSystemPrompt } from '@/lib/actions';
import { ChatFetchOptions, defaultModel, modelConfig, ModelID, Models } from '@/lib/ai';
import { formatMessageContent, tryCatch } from '@/lib/utils';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { LanguageModelV2 } from '@ai-sdk/provider';
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  customProvider,
  extractReasoningMiddleware,
  ModelMessage,
  smoothStream,
  streamText,
  wrapLanguageModel,
} from 'ai';

import { NextRequest } from 'next/server';

const google = createGoogleGenerativeAI({ apiKey: env.GEMINI });
const groq = createGroq({ apiKey: env.GROQ });

const createLanguageModel = ({ value, provider, features }: (typeof Models)[number]) => {
  const baseModel =
    provider === 'google' ? google.languageModel(value)
    : provider === 'groq' ? groq.languageModel(value)
    : null;

  if (!baseModel) {
    return null;
  }

  return provider === 'groq' && features.includes('reasoning') ?
      wrapLanguageModel({
        model: baseModel,
        middleware: extractReasoningMiddleware({ tagName: 'think', startWithReasoning: true }),
      })
    : baseModel;
};

const languageModels = Models.reduce(
  (acc, model) => {
    const modelInstance = createLanguageModel(model);
    if (modelInstance) {
      acc[model.value] = modelInstance;
    }
    return acc;
  },
  {} as Record<ModelID, LanguageModelV2>,
);

const modelProvider = customProvider({
  languageModels,
});

export async function POST(req: NextRequest) {
  const parsed: ChatFetchOptions = await req.json();
  const { messages } = parsed;
  const system = !!parsed.system?.trim() ? parsed.system.trim() : ((await tryCatch(fetchSystemPrompt())).data ?? '');

  const coreMessages = messages.map((msg) => ({
    role: msg.role,
    content: formatMessageContent(msg.content, msg.attachments),
  })) as ModelMessage[];

  const model = modelProvider.languageModel(parsed.model ?? defaultModel);

  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      writer.write({
        type: 'data-status',
        data: { status: 'streaming' },
      });

      const result = streamText({
        system,
        model,
        messages: coreMessages,
        temperature: modelConfig.temperature,
        maxOutputTokens: modelConfig.maxOutputTokens,
        // frequencyPenalty: modelConfig.frequencyPenalty,
        // presencePenalty: modelConfig.presencePenalty,
        abortSignal: req.signal,
        experimental_transform: smoothStream({ delayInMs: null }),
        onFinish: ({ usage }) => {
          writer.write({
            type: 'data-status',
            data: { status: 'done' },
          });
        },
        onError: ({ error }) => {
          writer.write({
            type: 'data-status',
            data: { status: 'error' },
          });
        },
      });
      writer.merge(result.toUIMessageStream());
    },
  });
  return createUIMessageStreamResponse({ stream });
}
