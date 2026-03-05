import { env } from '@/env';
import {
  ChatFetchOptions,
  CustomTool,
  CustomTools,
  defaultModel,
  DND_SYSTEM_PROMPT,
  DND_TOOLS_PROMPT,
  dndTools,
  Model,
  modelConfig,
  ModelID,
  Models,
} from '@/lib/ai';
import glovedApi from '@/lib/glovedapi';
import { formatMessageContent } from '@/lib/utils';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { type LanguageModelV2 } from '@ai-sdk/provider';
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
  ToolSet,
  wrapLanguageModel,
} from 'ai';

import { NextRequest } from 'next/server';

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

  return (provider === 'groq' || provider === 'openrouter') && features.includes('reasoning') ?
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

export const modelProvider = customProvider({
  languageModels,
});

export async function POST(req: NextRequest) {
  const parsed: ChatFetchOptions = await req.json();
  console.log('[CHAT] Received chat request', parsed);
  let system = parsed.system ? parsed.system.trim() : ((await glovedApi.getSystemPrompt())?.data ?? '');

  const coreMessages = parsed.messages.map((msg) => ({
    role: msg.role,
    content: formatMessageContent(msg.content, msg.attachments),
  })) as ModelMessage[];

  const model = modelProvider.languageModel(parsed.model ?? defaultModel);

  /**
   * Returns a ToolSet object containing the custom tools available in the model.
   * The ToolSet object will be undefined if no custom tools are available in the model.
   * @param {CustomTools} tools - The custom tools to check.
   * @returns {ToolSet | undefined} The ToolSet object containing the custom tools available in the model.
   */
  const getTools = (tools?: CustomTools): ToolSet | undefined => {
    const allTools: ToolSet = {};
    if (!tools || tools.length === 0) {
      return undefined;
    }

    /**
     * Returns the Model instance corresponding to the given modelId.
     * @param {ModelID} modelId - The id of the model to retrieve.
     * @returns {Model} The Model instance corresponding to the given modelId.
     * @throws Throws an error if the modelId is not found in the Models array.
     */
    const getModel = (modelId: ModelID): Model | undefined => {
      console.log('[CHAT] Getting model', modelId);
      return Models.find((model) => model.value === modelId);
    };

    /**
     * Checks if a given custom tool is available in the selected model.
     * @param {CustomTool} tool - The custom tool to check.
     * @returns {boolean} True if the tool is available, false otherwise.
     */
    const isToolAvailable = (tool: (typeof CustomTool)[keyof typeof CustomTool]): boolean => {
      console.log('[CHAT] Checking if tool', tool, 'is available for model', parsed.model ?? defaultModel);
      const model = getModel(parsed.model ?? defaultModel);
      return model ? model.tools.includes(tool) : false;
    };

    system += '\n\nYou have access to the following tools:';

    /* Add Tools to Tools List */
    if (tools.includes(CustomTool.DND_TOOLS) && isToolAvailable(CustomTool.DND_TOOLS)) {
      console.log('[CHAT] Adding D&D tools');
      Object.entries(dndTools).forEach(([key, tool]) => {
        allTools[key] = tool;
      });
      system = DND_SYSTEM_PROMPT + '\n' + DND_TOOLS_PROMPT;
    }
    /* End of Add Tools to Tools List */

    if (Object.keys(allTools).length === 0) {
      console.log('[CHAT] No tools available');
      return undefined;
    }

    console.log('[CHAT] Tools:', allTools);
    console.log('[CHAT] System Prompt with Tools:', system);
    return allTools;
  };

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
        tools: getTools(parsed.tools),
        stopWhen: stepCountIs(5),
        temperature: modelConfig.temperature,
        maxOutputTokens: modelConfig.maxOutputTokens,
        // frequencyPenalty: modelConfig.frequencyPenalty,
        // presencePenalty: modelConfig.presencePenalty,
        abortSignal: req.signal,
        experimental_transform: smoothStream({ delayInMs: null }),
        onStepFinish: ({ toolCalls, toolResults }) => {
          for (const toolCall of toolCalls || []) {
            writer.write({
              type: 'data-status',
              data: { status: 'tool-call', tool: toolCall.toolName },
            });
          }
          for (const toolResult of toolResults || []) {
            writer.write({
              type: 'data-status',
              data: { status: 'tool-done', tool: toolResult.toolName, result: toolResult.output },
            });
          }
        },
        onChunk: ({ chunk }) => {},
        onFinish: ({ usage }) => {
          writer.write({
            type: 'data-status',
            data: { status: 'done' },
          });
        },
        onError: ({ error }) => {
          writer.write({
            type: 'data-status',
            data: {
              status: 'error',
              error:
                error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string' ?
                  (error as any).message
                : 'Unknown error',
            },
          });
          console.error('[CHAT] Error:', (error as Error)?.message || error);
        },
      });
      writer.merge(result.toUIMessageStream());
    },
  });
  return createUIMessageStreamResponse({ stream });
}
