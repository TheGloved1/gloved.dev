import { tryCatch } from '../utils';
import { CustomTools, ModelID } from './';

export * from './config';
export * from './embeddings';
export * from './models';
export * from './onboarding';
export * from './tools';

/**
 * Generic type to extract the return type of a tool's execute function
 */
export type ToolOutput<T extends { execute?: (...args: any[]) => any }> = Awaited<NonNullable<T['execute']>>;

export type ApiMessage = {
  role: 'user' | 'assistant';
  content: string;
  attachments?: string[];
};
export type ChatFetchOptions = {
  messages: ApiMessage[];
  model?: ModelID;
  system?: string;
  tools?: CustomTools;
};

export type EmbedFetchOptions = {
  messages: ApiMessage[];
};

export type EmbedResponse = {
  embeddings: number[][];
};

/**
 * Sends a request to the chat api to generate a response based on the given options.
 * @param {ChatFetchOptions} options - An object containing the chat server request options.
 * @param {AbortSignal} signal - An optional AbortSignal to cancel the request.
 * @returns A Promise that resolves with a Result containing the response or an error.
 */
export async function aiGenerate(options: ChatFetchOptions, signal?: AbortSignal) {
  return await tryCatch(
    fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
      signal,
    }) as Promise<Response>,
  );
}
