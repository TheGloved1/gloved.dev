import { getLocalMessages, type Message, type Thread } from '@/lib/chat-store';
import { generateEmbedding } from '../actions';

type RelevantContent = {
  id: string;
  content: string;
  similarity: number;
};

type EmbeddingResult = {
  shouldUseEmbeddings: boolean;
  embeddedMessageCount?: number;
};

export const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split('.')
    .filter((i) => i !== '');
};

export const findRelevantContent = async (userQuery: string, threadId: string): Promise<RelevantContent[]> => {
  const userQueryEmbedded = await generateEmbedding(userQuery);
  const threadMap: Record<string, Thread> = JSON.parse(localStorage.getItem('gloved_chat_threads') || '{}');
  const thread = threadMap[threadId];
  if (!thread?.embeddings || thread.embeddings.values.length === 0) {
    console.log('[EMBEDDINGS] No embeddings found for thread:', threadId);
    return [];
  }
  const messages = getLocalMessages(threadId);
  const similarities = thread.embeddings.values.map((embedding) => cosineSimilarity(userQueryEmbedded, embedding));
  const relevantContent = similarities
    .map((similarity, index) => {
      const message = messages[index];
      if (!message) return null;
      return {
        id: message.id,
        content: message.content,
        similarity,
      } as RelevantContent;
    })
    .filter((result): result is RelevantContent => result !== null && result.similarity > 0.5)
    .sort((a, b) => b.similarity - a.similarity);
  return relevantContent;
};

export const formatRelevantContent = (relevantContent: RelevantContent[]): string => {
  if (relevantContent.length === 0) return '';
  const formatted = relevantContent.map((msg) => `Content: ${msg.content}`);
  return `Relevant context from previous messages:\n\n${formatted.join('\n\n')}\n\n`;
};

export const getRelevantContentForSystemPrompt = async (threadId: string, userQuery: string): Promise<RelevantContent[]> => {
  console.log('[EMBEDDINGS] Getting relevant content', { threadId, userQuery });
  const relevantContent = await findRelevantContent(userQuery, threadId);
  if (relevantContent.length === 0) {
    console.log('[EMBEDDINGS] No relevant content found, fetching recent messages as fallback');
    const messages = getLocalMessages(threadId).reverse().slice(0, 5);
    return messages.map((message) => ({
      id: message.id,
      content: message.content,
      similarity: 0.1,
    }));
  }
  return relevantContent;
};

export async function smartEmbeddingManager(threadId: string): Promise<EmbeddingResult> {
  console.log('[EMBEDDINGS] Smart embedding manager disabled in chat-store migration');
  return { shouldUseEmbeddings: false };
}

export async function checkEmbeddings(userMessage: Message): Promise<boolean> {
  console.log('[EMBEDDINGS] Embeddings disabled');
  return false;
}

export async function findRelevantContentWithFallback(userQuery: string, threadId: string): Promise<RelevantContent[]> {
  console.log('[EMBEDDINGS] Find relevant content with fallback (stub)');
  return [];
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) throw new Error('Vectors must be of same length');
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
