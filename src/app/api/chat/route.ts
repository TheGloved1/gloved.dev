import { Message } from '@/db';
import { env } from '@/env';
import { fetchSystemPrompt } from '@/lib/actions';
import Constants from '@/lib/constants';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import {
  CoreMessage,
  createDataStreamResponse,
  extractReasoningMiddleware,
  LanguageModelV1,
  smoothStream,
  streamText,
  wrapLanguageModel,
} from 'ai';

const genAI = createGoogleGenerativeAI({ apiKey: env.GEMINI });
const groq = createGroq({ apiKey: env.GROQ });

const temperature = 0.95;
const maxTokens = 4096;
const frequencyPenalty = 0.75;
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

function getModel(model?: string): LanguageModelV1 {
  if (!model) {
    return genAI.languageModel('gemini-1.5-flash', { safetySettings });
  }

  if (model in GoogleModels) {
    return genAI.languageModel(GoogleModels[model as keyof typeof GoogleModels], { safetySettings }) as LanguageModelV1;
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

  return genAI.languageModel('gemini-1.5-flash', { safetySettings }) as LanguageModelV1;
}

export async function POST(req: Request) {
  const parsed: { model?: string; system?: string; messages: Omit<Message, 'id'>[] } = await req.json();
  const { messages } = parsed;
  const system = parsed.system ?? (await fetchSystemPrompt());

  const coreMessages = messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  })) as CoreMessage[];

  const model = getModel(parsed.model);

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
        experimental_transform: smoothStream(),
      });
      result.mergeIntoDataStream(dataStream, { sendReasoning: true });
    },
    onError: (error) => {
      // Error messages are masked by default for security reasons.
      // If you want to expose the error message to the client, you can do so here:
      return error instanceof Error ? error.message : String(error);
    },
  });
}
