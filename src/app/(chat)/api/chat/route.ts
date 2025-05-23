import { env } from '@/env';
import { fetchSystemPrompt } from '@/lib/actions';
import { ChatFetchOptions, defaultModel, modelConfig, ModelID, Models, safetySettings } from '@/lib/ai';
import { toolPrompt } from '@/lib/ai/tool-prompt';
import { uploadFile, uploadZipFile } from '@/lib/ai/tools';
import { formatMessageContent, tryCatch } from '@/lib/utils';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
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
import { NextRequest } from 'next/server';

const google = createGoogleGenerativeAI({ apiKey: env.GEMINI });
const groq = createGroq({ apiKey: env.GROQ });
const openrouter = createOpenRouter({ apiKey: env.OPENROUTER });

const languageModels = Models.reduce(
  (acc, { value, provider, features }) => {
    if (provider === 'google') {
      acc[value] = google.languageModel(value, { safetySettings });
    } else if (provider === 'groq') {
      if (features.reasoning) {
        acc[value] = wrapLanguageModel({
          model: groq.languageModel(value),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        });
      } else {
        acc[value] = groq.languageModel(value);
      }
    } else if (provider === 'openrouter') {
      acc[value] = openrouter.languageModel(value, {
        reasoning: {
          effort: 'low',
          exclude: false,
        },
      });
    }
    return acc;
  },
  {} as Record<ModelID, LanguageModelV1>,
);

const modelProvider = customProvider({
  languageModels,
});

export async function POST(req: NextRequest) {
  const parsed: ChatFetchOptions = await req.json();
  const { messages, toolsEnabled } = parsed;
  let system = !!parsed.system?.trim() ? parsed.system.trim() : ((await tryCatch(fetchSystemPrompt())).data ?? '');

  const coreMessages = messages.map((msg) => ({
    role: msg.role,
    content: formatMessageContent(msg.content, msg.attachments),
  })) as CoreMessage[];

  const model = modelProvider.languageModel(parsed.model ?? defaultModel);

  // Don't send penalties if the model is gemini-2.5-pro-exp-03-25 or gemini-2.5-flash-preview-04-17
  const freqPenalty =
    parsed.model !== 'gemini-2.5-pro-exp-03-25' && parsed.model !== 'gemini-2.5-flash-preview-04-17' ?
      modelConfig.frequencyPenalty
    : undefined;
  const presPenalty =
    parsed.model !== 'gemini-2.5-pro-exp-03-25' && parsed.model !== 'gemini-2.5-flash-preview-04-17' ?
      modelConfig.presencePenalty
    : undefined;

  let tools = undefined;
  if (Models.find((d) => d.value === parsed.model)?.features.tools && toolsEnabled) {
    tools = { uploadFile, uploadZipFile };
    system = system + '\n\n' + toolPrompt;
  }

  return createDataStreamResponse({
    execute: (dataStream) => {
      const result = streamText({
        system,
        model,
        messages: coreMessages,
        tools,
        temperature: modelConfig.temperature,
        maxTokens: modelConfig.maxTokens,
        frequencyPenalty: freqPenalty,
        presencePenalty: presPenalty,
        abortSignal: req.signal,
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
