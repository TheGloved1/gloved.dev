import { env } from '@/env';
import {
  ChatFetchOptions,
  CustomTool,
  DEFAULT_MODEL,
  Feature,
  Model,
  modelConfig,
  ModelID,
  Models,
  TOOL_CONFIG,
} from '@/lib/ai';
import { debugLog } from '@/lib/debug';
import glovedApi from '@/lib/glovedapi';
import { deleteStreamContent, publishStreamStatus, publishStreamUpdate, setStreamContent } from '@/lib/redis';
import { formatMessageContent } from '@/lib/utils';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { type LanguageModelV2 } from '@ai-sdk/provider';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  customProvider,
  extractReasoningMiddleware,
  ModelMessage,
  smoothStream,
  stepCountIs,
  streamText,
  Tool,
  ToolSet,
  wrapLanguageModel,
} from 'ai';
import { ConvexHttpClient } from 'convex/browser';

import { NextRequest as Request } from 'next/server';

const google = createGoogleGenerativeAI({ apiKey: env.GEMINI });
const groq = createGroq({ apiKey: env.GROQ });
const openrouter = createOpenRouter({ apiKey: env.OPENROUTER });

const createLanguageModel = ({ value, provider, features }: (typeof Models)[number]) => {
  const baseModel =
    provider === 'google' ? google.languageModel(value)
    : provider === 'groq' ? groq.languageModel(value)
    : provider === 'openrouter' ? openrouter.languageModel(value)
    : null;

  if (!baseModel) {
    return null;
  }

  return (provider === 'groq' || provider === 'openrouter') && features.includes(Feature.REASONING) ?
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

let convexClient: ConvexHttpClient | null = null;
function getConvexClient(): ConvexHttpClient {
  if (!convexClient) {
    const url = env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) throw new Error('NEXT_PUBLIC_CONVEX_URL is not set');
    convexClient = new ConvexHttpClient(url);
  }
  return convexClient;
}

export const modelProvider = customProvider({
  languageModels,
});

const getSystemPrompt = async (system?: string): Promise<string> => {
  debugLog('[CHAT] getSystemPrompt', system);
  return system ?? (await glovedApi.getSystemPrompt()).data ?? '';
};

async function consumeRedisStream(
  stream: ReadableStream,
  messageId: string | undefined,
  state: { content: string; reasoning: string },
): Promise<void> {
  if (!messageId) return;

  const reader = stream.getReader();
  let lastRedisWrite = 0;
  const REDIS_INTERVAL = 200;

  const flush = async (force = false) => {
    const now = Date.now();
    if (!force && now - lastRedisWrite < REDIS_INTERVAL) return;
    lastRedisWrite = now;
    try {
      await Promise.all([
        setStreamContent(messageId, state.content, state.reasoning),
        publishStreamUpdate(messageId, state.content, state.reasoning),
      ]);
    } catch (e) {
      console.warn('[CHAT] redis write failed', e);
    }
  };

  try {
    while (true) {
      const { done } = await reader.read();
      if (done) break;
      await flush();
    }
    await flush(true);
  } catch (e) {
    console.warn('[CHAT] consumeRedisStream error', e);
  }
}

export async function POST(req: Request) {
  const options: ChatFetchOptions = await req.json();
  console.log('[CHAT] Received chat request', {
    model: options.model,
    hasTools: !!options.tools?.length,
    messageCount: options.messages.length,
  });
  let system = await getSystemPrompt(options.system);

  const coreMessages = options.messages.map((msg) => ({
    role: msg.role,
    content: formatMessageContent(msg.content, msg.attachments),
  })) as ModelMessage[];

  const model = modelProvider.languageModel(options.model ?? DEFAULT_MODEL);

  let tools: ToolSet | undefined;

  const getTools = async (): Promise<void> => {
    if (!options.tools || options.tools.length === 0) {
      return;
    }

    const getModel = (modelId: ModelID): Model | undefined => {
      return Models.find((model) => model.value === modelId);
    };

    const isValidTool = (tool: CustomTool, modelId: ModelID): boolean => {
      const model = getModel(modelId);
      return model ? model.tools.includes(tool) : false;
    };

    /* Add Tools to Tools List */
    // Automatically process all tools from TOOL_CONFIG
    for (const [_toolKey, toolConfig] of Object.entries(TOOL_CONFIG)) {
      if (options.tools.includes(toolConfig.value) && isValidTool(toolConfig.value, options.model ?? DEFAULT_MODEL)) {
        const toolImplementation = await toolConfig.create();
        Object.entries(toolImplementation.tools).forEach(([key, tool]: [string, Tool]) => {
          tools = { ...tools, [key]: tool };
        });

        // Add system prompt if available
        if ('system' in toolImplementation.prompts && toolImplementation.prompts.system) {
          system = toolImplementation.prompts.system + '\n\n' + toolImplementation.prompts.tools;
        } else if (toolImplementation.prompts?.tools) {
          system += '\n\n' + toolImplementation.prompts.tools;
        }
      }
    }
    /* End of Add Tools to Tools List */
  };

  await getTools();

  const hasConvexTarget = !!options.convexThreadId && !!options.convexAssistantMessageId;

  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      writer.write({
        type: 'data-status',
        data: { status: 'streaming' },
      });

      const state = { content: '', reasoning: '' };

      const result = streamText({
        system,
        model,
        messages: coreMessages,
        tools,
        stopWhen: stepCountIs(5),
        temperature: modelConfig.temperature,
        maxOutputTokens: modelConfig.maxOutputTokens,
        experimental_transform: smoothStream({ delayInMs: 10 }),
        onStepFinish: ({ toolCalls, toolResults }) => {
          for (const toolCall of toolCalls) {
            writer.write({
              type: 'data-status',
              data: { status: 'tool-call', toolName: toolCall.toolName, toolCallId: toolCall.toolCallId },
            });
          }
          for (const toolResult of toolResults) {
            writer.write({
              type: 'data-status',
              data: {
                status: 'tool-done',
                toolName: toolResult.toolName,
                toolCallId: toolResult.toolCallId,
                toolResult: toolResult.output,
              },
            });
          }
        },
        onChunk: ({ chunk }) => {
          if (chunk.type === 'text-delta') {
            state.content += chunk.text;
          } else if (chunk.type === 'reasoning-delta') {
            state.reasoning += chunk.text;
          }
        },
        onFinish: async () => {
          writer.write({
            type: 'data-status',
            data: { status: 'done' },
          });
          if (options.convexAssistantMessageId) {
            await publishStreamStatus(options.convexAssistantMessageId, state.content, state.reasoning || undefined, 'done');
            await deleteStreamContent(options.convexAssistantMessageId);
          }
          if (hasConvexTarget) {
            try {
              await getConvexClient().mutation(api.messages.setDone, {
                id: options.convexAssistantMessageId! as Id<'messages'>,
                content: state.content,
                reasoning: state.reasoning || undefined,
              });
            } catch (e) {
              console.error('[CHAT] setDone mutation failed', e);
            }
          }
        },
        onError: async ({ error }) => {
          const errMsg = error instanceof Error ? error.message : 'Unknown error';
          console.error('[CHAT] Error:', errMsg);
          writer.write({
            type: 'data-status',
            data: {
              status: 'error',
              error: errMsg,
            },
          });
          if (options.convexAssistantMessageId) {
            await publishStreamStatus(
              options.convexAssistantMessageId,
              state.content || errMsg,
              state.reasoning || undefined,
              'error',
            );
            await deleteStreamContent(options.convexAssistantMessageId);
          }
          if (hasConvexTarget) {
            try {
              await getConvexClient().mutation(api.messages.setError, {
                id: options.convexAssistantMessageId! as Id<'messages'>,
                content: state.content || 'Error: No content received',
              });
            } catch (e) {
              console.error('[CHAT] setError mutation failed', e);
            }
          }
        },
      });
      const uiStream = result.toUIMessageStream();
      const [sseBranch, redisBranch] = uiStream.tee();
      writer.merge(sseBranch);
      consumeRedisStream(redisBranch, options.convexAssistantMessageId, state);
    },
  });
  const resp = createUIMessageStreamResponse({ stream });
  return resp;
}
