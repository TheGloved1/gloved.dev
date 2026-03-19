import { env } from '@/env';
import {
  ChatFetchOptions,
  CustomTool,
  defaultModel,
  Feature,
  Model,
  modelConfig,
  ModelID,
  Models,
  TOOL_CONFIG,
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
  Tool,
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

export const modelProvider = customProvider({
  languageModels,
});

/**
 * Retrieves the system prompt from the gloved API if no custom system prompt is provided.
 * @param {string} [system] - The custom system prompt to use instead of the gloved API's system prompt.
 * @returns {Promise<string>} The system prompt to use for the chat.
 */
const getSystemPrompt = async (system?: string): Promise<string> => {
  return system ? system : ((await glovedApi.getSystemPrompt())?.data ?? '');
};

export async function POST(req: NextRequest) {
  const options: ChatFetchOptions = await req.json();
  console.log('[CHAT] Received chat request', options);
  let system = await getSystemPrompt(options.system);

  const coreMessages = options.messages.map((msg) => ({
    role: msg.role,
    content: formatMessageContent(msg.content, msg.attachments),
  })) as ModelMessage[];

  const model = modelProvider.languageModel(options.model ?? defaultModel);

  let tools: ToolSet | undefined;

  /**
   * Retrieves the tools for the given model and adds them to the tools list.
   * If the model supports D&D, it will also add the D&D tools to the tools list
   * and set the system prompt with the D&D tools.
   */
  const getTools = async (): Promise<void> => {
    if (!options.tools || options.tools.length === 0) {
      return;
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
     * @param {ModelID} modelId - The id of the model to check.
     * @returns {boolean} True if the tool is available, false otherwise.
     */
    const isValidTool = (tool: CustomTool, modelId: ModelID): boolean => {
      console.log('[CHAT] Checking if tool', tool, 'is available for model', modelId);
      const model = getModel(modelId);
      return model ? model.tools.includes(tool) : false;
    };

    /* Add Tools to Tools List */
    // Automatically process all tools from TOOL_CONFIG
    for (const [_toolKey, toolConfig] of Object.entries(TOOL_CONFIG)) {
      if (options.tools.includes(toolConfig.value) && isValidTool(toolConfig.value, options.model ?? defaultModel)) {
        console.log(`[CHAT] Adding ${toolConfig.name} to tools list...`);
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
        tools,
        stopWhen: stepCountIs(5),
        temperature: modelConfig.temperature,
        maxOutputTokens: modelConfig.maxOutputTokens,
        // frequencyPenalty: modelConfig.frequencyPenalty,
        // presencePenalty: modelConfig.presencePenalty,
        abortSignal: req.signal,
        experimental_transform: smoothStream({ delayInMs: null }),
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
        // onChunk: ({ chunk }) => {},
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
