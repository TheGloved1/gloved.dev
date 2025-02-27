import { Message } from '@/db';
import { env } from '@/env';
import { fetchSystemPrompt } from '@/lib/actions';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { CoreMessage, createDataStreamResponse, smoothStream, streamText } from 'ai';

const genAI = createGoogleGenerativeAI({ apiKey: env.GEMINI });

const temperature = 0.95;
const maxTokens = 8192;
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

export async function POST(req: Request) {
  const parsed: { model?: string; system?: string; messages: Omit<Message, 'id'>[] } = await req.json();
  const { messages } = parsed;
  const system = parsed.system ?? (await fetchSystemPrompt());

  const coreMessages = messages.map((msg) => ({
    role: msg.role, // Ensure this is set correctly
    content: msg.content,
  })) as CoreMessage[];

  const model = genAI.languageModel(parsed.model ?? 'gemini-1.5-flash', {
    safetySettings: safetySettings,
  });

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
      result.mergeIntoDataStream(dataStream);
    },
    onError: (error) => {
      // Error messages are masked by default for security reasons.
      // If you want to expose the error message to the client, you can do so here:
      return error instanceof Error ? error.message : String(error);
    },
  });
}
