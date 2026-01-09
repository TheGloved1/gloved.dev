import { env } from '$lib/env';
import { fetchSystemPrompt } from '$lib/global.remote';
import { type ChatFetchOptions, defaultModel, modelConfig, Models, type ModelID } from '$lib/ai';
import { formatMessageContent } from '$lib/utils';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { type LanguageModelV2 } from '@ai-sdk/provider';
import {
	createUIMessageStream,
	createUIMessageStreamResponse,
	customProvider,
	extractReasoningMiddleware,
	streamText,
	smoothStream,
	wrapLanguageModel
} from 'ai';
import type { RequestHandler } from '@sveltejs/kit';
import type { ModelMessage } from 'ai';

const google = createGoogleGenerativeAI({ apiKey: env.GEMINI });
const groq = createGroq({ apiKey: env.GROQ });

const languageModels = Models.reduce(
	(acc, { value, provider, features }) => {
		if (provider === 'google') {
			acc[value as ModelID] = google.languageModel(value);
		} else if (provider === 'groq') {
			if (features.includes('reasoning')) {
				acc[value as ModelID] = wrapLanguageModel({
					model: groq.languageModel(value),
					middleware: extractReasoningMiddleware({ tagName: 'think', startWithReasoning: true })
				});
			} else {
				acc[value as ModelID] = groq.languageModel(value);
			}
		}
		return acc;
	},
	{} as Record<ModelID, LanguageModelV2>
);

const modelProvider = customProvider({ languageModels });

export const POST: RequestHandler = async ({ request }) => {
	const parsed = (await request.json()) as ChatFetchOptions;
	const { messages } = parsed;
	const sysRes = await fetchSystemPrompt();
	const system = parsed.system && parsed.system.trim() ? parsed.system.trim() : (sysRes ?? '');

	const coreMessages = messages.map((msg) =>
		msg.role === 'user'
			? {
					role: 'user' as const,
					content: formatMessageContent(msg.content, msg.attachments)
				}
			: {
					role: 'assistant' as const,
					content: msg.content
				}
	);

	const model = modelProvider.languageModel(parsed.model ?? defaultModel);

	const stream = createUIMessageStream({
		execute: ({ writer }) => {
			writer.write({ type: 'data-status', data: { status: 'streaming' } });

			const result = streamText({
				system,
				model,
				messages: coreMessages as ModelMessage[],
				temperature: modelConfig.temperature,
				maxOutputTokens: modelConfig.maxOutputTokens,
				abortSignal: request.signal,
				experimental_transform: smoothStream({ delayInMs: null }),
				onFinish: () => {
					writer.write({ type: 'data-status', data: { status: 'done' } });
				},
				onError: () => {
					writer.write({ type: 'data-status', data: { status: 'error' } });
				}
			});

			writer.merge(result.toUIMessageStream());
		}
	});

	return createUIMessageStreamResponse({ stream });
};
