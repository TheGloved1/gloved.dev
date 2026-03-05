import { dxdb, Message } from '@/lib/dexie';
import { tryCatch } from '@/lib/utils';
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

/**
 * Splits a string into chunks based on periods.
 * @param input The input string to split.
 * @returns An array of chunks.
 */
export const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split('.')
    .filter((i) => i !== '');
};

/**
 * Finds relevant content from a thread based on a user query using embedding similarity.
 * @param userQuery The user's query to search for.
 * @param threadId The ID of the thread to search in.
 * @returns A promise that resolves to an array of relevant content entries.
 */
export const findRelevantContent = async (userQuery: string, threadId: string): Promise<RelevantContent[]> => {
  const userQueryEmbedded = await generateEmbedding(userQuery);
  // Get the specific thread with embeddings from Dexie
  const threadResult = await tryCatch(dxdb.threads.get(threadId));
  if (threadResult.error || !threadResult.data) {
    console.error('[EMBEDDINGS] Error fetching thread:', threadResult.error);
    return [];
  }

  const thread = threadResult.data;

  // Check if thread has embeddings
  if (!thread.embeddings || thread.embeddings.values.length === 0) {
    console.log('[EMBEDDINGS] No embeddings found for thread:', threadId);
    return [];
  }

  // Get messages for this thread to provide context
  const messagesResult = await tryCatch(dxdb.messages.where('threadId').equals(threadId).toArray());
  if (messagesResult.error || !messagesResult.data) {
    console.error('[EMBEDDINGS] Error fetching messages:', messagesResult.error);
    return [];
  }

  const messages = messagesResult.data;

  // Calculate similarity between user query and thread embeddings
  const similarities = thread.embeddings.values.map((embedding, index) => cosineSimilarity(userQueryEmbedded, embedding));

  // Create relevant content entries with message context
  const relevantContent = similarities
    .map((similarity, index) => {
      const message = messages[index];
      return {
        id: message.id,
        content: message.content,
        similarity,
      } as RelevantContent;
    })
    .filter((result) => result.similarity > 0.5) // Filter by similarity threshold
    .sort((a, b) => b.similarity - a.similarity); // Sort by similarity descending

  return relevantContent;
};

export const formatRelevantContent = (relevantContent: RelevantContent[]): string => {
  if (relevantContent.length === 0) {
    return '';
  }
  const formatted = relevantContent.map((msg) => `Content: ${msg.content}`);
  return `Relevant context from previous messages:\n\n${formatted.join('\n\n')}\n\n`;
};

export const getRelevantContentForSystemPrompt = async (threadId: string, userQuery: string): Promise<RelevantContent[]> => {
  console.log('[EMBEDDINGS] Getting relevant content for system prompt', { threadId, userQuery });

  // Use the existing findRelevantContent function to get relevant messages
  const relevantContent = await findRelevantContent(userQuery, threadId);

  // If no relevant content found, try to get some recent messages as fallback
  if (relevantContent.length === 0) {
    console.log('[EMBEDDINGS] No relevant content found, fetching recent messages as fallback');

    const messagesResult = await tryCatch(dxdb.messages.where('threadId').equals(threadId).reverse().limit(5).toArray());

    if (!messagesResult.error && messagesResult.data) {
      // Return recent messages with low similarity score
      return messagesResult.data.map((message) => ({
        id: message.id,
        content: message.content,
        similarity: 0.1, // Low similarity for fallback content
      }));
    }
  }

  console.log('[EMBEDDINGS] Found relevant content:', relevantContent.length, 'entries');
  return relevantContent;
};

/**
 * Smart embedding manager that handles embeddings based on thread size.
 * Creates embeddings for the last 50 messages when thread reaches 100 messages.
 * @param threadId The ID of the thread to manage embeddings for.
 * @returns Promise resolving to embedding result with usage information.
 */
export async function smartEmbeddingManager(threadId: string): Promise<EmbeddingResult> {
  console.log('[EMBEDDINGS] Smart embedding manager for thread:', threadId);

  try {
    const messageCount = await dxdb.messages
      .where('threadId')
      .equals(threadId)
      .and((message) => message.status !== 'deleted' && message.status !== 'error')
      .count();
    console.log('[EMBEDDINGS] Thread message count:', messageCount);

    if (messageCount < 100) {
      console.log('[EMBEDDINGS] Thread too small for embeddings, skipping');
      return { shouldUseEmbeddings: false };
    }

    // Get last 50 messages for embedding
    const recentMessages = await dxdb.messages.where('threadId').equals(threadId).reverse().limit(50).toArray();

    console.log('[EMBEDDINGS] Found', recentMessages.length, 'recent messages to embed');

    // Generate embeddings for these messages
    const messageTexts = recentMessages.map((msg) => msg.content);
    const combinedText = messageTexts.join('\n\n');
    const embedding = await generateEmbedding(combinedText);

    // Get the oldest message ID from the recent messages (this becomes our threshold)
    const oldestEmbeddedMessageId = recentMessages[recentMessages.length - 1]?.id;

    if (!oldestEmbeddedMessageId) {
      console.error('[EMBEDDINGS] No oldest message ID found');
      return { shouldUseEmbeddings: false };
    }

    // Update thread with new embeddings
    await dxdb.threads.update(threadId, {
      embeddings: {
        values: [embedding], // Store as single embedding for now
        last_embedded_message_id: oldestEmbeddedMessageId,
        system_memory: '', // Can be populated later with system context
      },
    });

    console.log(
      '[EMBEDDINGS] Embeddings updated for thread:',
      threadId,
      'oldest embedded message:',
      oldestEmbeddedMessageId,
    );

    return { shouldUseEmbeddings: true, embeddedMessageCount: 50 };
  } catch (error) {
    console.error('[EMBEDDINGS] Error in smart embedding manager:', error);
    return { shouldUseEmbeddings: false };
  }
}

/**
 * Generates system memory from embeddings and updates the thread.
 * @param userMessage The message to generate embeddings for.
 * @returns Promise resolving to boolean indicating if embeddings were used.
 */
export async function checkEmbeddings(userMessage: Message): Promise<boolean> {
  console.log('[EMBEDDINGS] Checking embeddings for message in thread:', userMessage.threadId);

  try {
    const result = await smartEmbeddingManager(userMessage.threadId);

    if (result.shouldUseEmbeddings) {
      // Generate system memory from relevant content
      const relevantContent = await findRelevantContentWithFallback(userMessage.content, userMessage.threadId);
      const systemMemory = formatRelevantContent(relevantContent);

      // Get current thread data
      const thread = await dxdb.threads.get(userMessage.threadId);

      // Update thread with system memory
      await dxdb.threads.update(userMessage.threadId, {
        embeddings: {
          values: thread?.embeddings?.values || [],
          last_embedded_message_id: thread?.embeddings?.last_embedded_message_id || '',
          system_memory: systemMemory,
        },
      });

      console.log('[EMBEDDINGS] Updated system memory for thread:', userMessage.threadId);
    }

    return result.shouldUseEmbeddings;
  } catch (error) {
    console.error('[EMBEDDINGS] Error checking embeddings:', error);
    return false;
  }
}

/**
 * Enhanced relevant content finder that works with the new embedding system.
 * Searches for relevant content in older messages using embeddings when available.
 * @param userQuery The user's query to search for.
 * @param threadId The ID of the thread to search in.
 * @returns Promise resolving to array of relevant content entries.
 */
export async function findRelevantContentWithFallback(userQuery: string, threadId: string): Promise<RelevantContent[]> {
  console.log('[EMBEDDINGS] Finding relevant content with fallback for thread:', threadId);

  const thread = await dxdb.threads.get(threadId);

  if (!thread?.embeddings?.last_embedded_message_id) {
    console.log('[EMBEDDINGS] No embeddings found, returning empty');
    return [];
  }

  // Get messages before the embedding threshold for similarity search
  const olderMessages = await dxdb.messages
    .where('threadId')
    .equals(threadId)
    .and((message) => message.status !== 'deleted' && message.status !== 'error' && message.status !== 'streaming')
    .and((message) => message.id <= thread.embeddings!.last_embedded_message_id)
    .toArray();

  console.log('[EMBEDDINGS] Found', olderMessages.length, 'older messages to search through');

  if (olderMessages.length === 0) {
    return [];
  }

  // Use the existing findRelevantContent logic but with the filtered messages
  const userQueryEmbedded = await generateEmbedding(userQuery);

  const similarities = thread.embeddings.values.map((embedding, index) => {
    if (index < olderMessages.length) {
      return cosineSimilarity(userQueryEmbedded, embedding);
    }
    return 0;
  });

  const relevantContent = similarities
    .map((similarity, index) => {
      if (index < olderMessages.length && similarity > 0.5) {
        const message = olderMessages[index];
        return {
          id: message.id,
          content: message.content,
          similarity,
        } as RelevantContent;
      }
      return null;
    })
    .filter((result): result is RelevantContent => result !== null)
    .sort((a, b) => b.similarity - a.similarity);

  console.log('[EMBEDDINGS] Found', relevantContent.length, 'relevant older messages');
  return relevantContent;
}

/**
 * Calculates the cosine similarity between two vectors.
 * Cosine similarity is a measure of the orientation of two vectors in a multi-dimensional space.
 * It ranges from -1 (completely opposite) to 1 (exactly the same), with 0 indicating orthogonality.
 * @param {number[]} vecA The first vector.
 * @param {number[]} vecB The second vector.
 * @returns {number} The cosine similarity between the two vectors.
 * @throws {Error} If the vectors are not of the same length.
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must be of same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
