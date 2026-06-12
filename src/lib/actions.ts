'use server';
import { env } from '@/env';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { embed, embedMany } from 'ai';
import { generateChunks } from './ai';
import glovedApi from './glovedapi';

export async function getUUID(): Promise<string> {
  return crypto.randomUUID();
}

/**
 * Fetches the system prompt from the server.
 * @returns A promise that resolves to the system prompt text.
 */
export async function fetchSystemPrompt() {
  return glovedApi.getSystemPrompt();
}

/**
 * Checks if the current environment is development.
 * @returns A promise that resolves to a boolean indicating if the environment is development.
 */
export async function checkDevMode(): Promise<boolean> {
  const environment = env.NODE_ENV;

  if (environment === 'development') {
    console.log('[DEV] Development mode enabled');
    return true;
  }
  return false;
}

const openrouter = createOpenRouter({ apiKey: env.OPENROUTER });
const embedModel = openrouter.textEmbeddingModel('nvidia/llama-nemotron-embed-vl-1b-v2:free');

/**
 * Generates embeddings for each line in the provided string value.
 * @param value The string value to generate embeddings for.
 * @returns A promise that resolves to an array of objects containing the embedding and the corresponding content.
 */
export const generateEmbeddings = async (value: string): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = generateChunks(value);
  const { embeddings } = await embedMany({
    model: embedModel,
    values: chunks,
  });
  return embeddings.map((e: number[], i: number) => ({ content: chunks[i], embedding: e }));
};

/**
 * Generates a single embedding for a given string value.
 * @param value The string value to generate an embedding for.
 * @returns A promise that resolves to the generated embedding as a number array.
 */
export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll('\\n', ' ');
  const { embedding } = await embed({
    model: embedModel,
    value: input,
  });
  return embedding;
};
