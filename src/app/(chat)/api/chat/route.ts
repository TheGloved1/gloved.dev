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

const languageModels = Models.reduce(
  (acc, { value, provider, features }) => {
    if (provider === 'google') {
      acc[value] = google.languageModel(value);
    } else if (provider === 'groq') {
      if (features.includes('reasoning')) {
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
        data: { status: 'call started' },
      });

      const result = streamText({
        system,
        model,
        messages: coreMessages,
        temperature: modelConfig.temperature,
        maxOutputTokens: modelConfig.maxOutputTokens,
        frequencyPenalty: modelConfig.frequencyPenalty,
        presencePenalty: modelConfig.presencePenalty,
        abortSignal: req.signal,
        experimental_transform: smoothStream({ delayInMs: null }),
        onChunk: ({ chunk }) => {
          writer.write({
            type: 'data-status',
            data: { status: 'streaming' },
          });
        },
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
