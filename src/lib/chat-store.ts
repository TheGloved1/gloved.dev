import { aiGenerate, ApiMessage, ChatFetchOptions, checkEmbeddings, CustomTools, ModelID, TITLE_MODEL } from '@/lib/ai';
import { ensureConvexThread, getConvexClient } from '@/lib/convex-client';
import { debugLog } from '@/lib/debug';
import { now } from '@/lib/utils';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { toast } from 'sonner';
import { z } from 'zod';

const EMBEDDING_ENABLED = false;

export const threadSchema = z.object({
  id: z.string(),
  title: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  last_message_at: z.string(),
  embeddings: z
    .object({
      values: z.array(z.array(z.number())),
      last_embedded_message_id: z.string(),
      system_memory: z.string(),
    })
    .optional(),
  status: z.enum(['streaming', 'done', 'error', 'deleted']),
});

export const messageSchema = z.object({
  id: z.string(),
  threadId: z.string(),
  content: z.string(),
  attachments: z.array(z.string()).optional(),
  reasoning: z.string().optional(),
  model: z.string(),
  role: z.enum(['user', 'assistant']),
  created_at: z.string(),
  updated_at: z.string(),
  status: z.enum(['streaming', 'done', 'error', 'deleted']),
  tools: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        status: z.enum(['running', 'done', 'error']),
        after: z.number(),
        result: z.any().optional(),
      }),
    )
    .optional(),
});

export type Thread = z.infer<typeof threadSchema>;
export type Message = z.infer<typeof messageSchema>;

// ---- LocalStorage storage (signed-out users) ----

const LC_THREADS = 'gloved_chat_threads';
const LC_MESSAGES_PREFIX = 'gloved_chat_msgs_';

function getLocalThreadsMap(): Record<string, Thread> {
  try {
    return JSON.parse(localStorage.getItem(LC_THREADS) || '{}');
  } catch {
    return {};
  }
}

function saveLocalThreadsMap(map: Record<string, Thread>) {
  localStorage.setItem(LC_THREADS, JSON.stringify(map));
}

function getLocalMessages(threadId: string): Message[] {
  try {
    return JSON.parse(localStorage.getItem(LC_MESSAGES_PREFIX + threadId) || '[]');
  } catch {
    return [];
  }
}

function saveLocalMessages(threadId: string, messages: Message[]) {
  localStorage.setItem(LC_MESSAGES_PREFIX + threadId, JSON.stringify(messages));
}

function addLocalMessage(msg: Omit<Message, 'id' | 'created_at' | 'updated_at'>): string {
  const id = crypto.randomUUID();
  const message: Message = { ...msg, id, created_at: now(), updated_at: now() };
  const messages = getLocalMessages(msg.threadId);
  messages.push(message);
  saveLocalMessages(msg.threadId, messages);
  return id;
}

function updateLocalMessageById(threadId: string, messageId: string, updates: Partial<Message>) {
  const messages = getLocalMessages(threadId);
  const idx = messages.findIndex((m) => m.id === messageId);
  if (idx >= 0) {
    messages[idx] = { ...messages[idx], ...updates, updated_at: now() };
    saveLocalMessages(threadId, messages);
  }
}

function getLocalThreads(): Thread[] {
  const map = getLocalThreadsMap();
  return Object.values(map)
    .filter((t) => t.status !== 'deleted')
    .sort((a, b) => (b.last_message_at || b.created_at).localeCompare(a.last_message_at || a.created_at));
}

function addLocalThread(): string {
  const id = crypto.randomUUID();
  const thread: Thread = {
    id,
    title: 'New Chat',
    created_at: now(),
    updated_at: now(),
    last_message_at: now(),
    status: 'done',
  };
  const map = getLocalThreadsMap();
  map[id] = thread;
  saveLocalThreadsMap(map);
  return id;
}

function updateLocalThread(id: string, updates: Partial<Thread>) {
  const map = getLocalThreadsMap();
  if (map[id]) {
    map[id] = { ...map[id], ...updates, updated_at: now() };
    saveLocalThreadsMap(map);
  }
}

function deleteLocalThread(threadId: string) {
  const map = getLocalThreadsMap();
  if (map[threadId]) {
    map[threadId].status = 'deleted';
    saveLocalThreadsMap(map);
  }
  localStorage.removeItem(LC_MESSAGES_PREFIX + threadId);
}

function deleteAllLocalData() {
  const map = getLocalThreadsMap();
  for (const id of Object.keys(map)) {
    localStorage.removeItem(LC_MESSAGES_PREFIX + id);
  }
  localStorage.removeItem(LC_THREADS);
}

// ---- In-memory stream store (real-time display during streaming) ----

type StreamState = {
  content: string;
  reasoning?: string;
  status: 'streaming' | 'done' | 'error';
  tools?: Message['tools'];
};

const streamStore = new Map<string, StreamState>();
const streamListeners = new Map<string, Set<() => void>>();
let streamVersion = 0;
const globalStreamListeners = new Set<() => void>();

export function getStreamState(messageId: string): StreamState | undefined {
  return streamStore.get(messageId);
}

export function subscribeToStream(messageId: string, callback: () => void): () => void {
  if (!streamListeners.has(messageId)) streamListeners.set(messageId, new Set());
  streamListeners.get(messageId)!.add(callback);
  return () => {
    streamListeners.get(messageId)?.delete(callback);
  };
}

export function subscribeToAllStreams(callback: () => void): () => void {
  globalStreamListeners.add(callback);
  return () => {
    globalStreamListeners.delete(callback);
  };
}

let updateCounter = 0;
export function updateStreamState(messageId: string, update: Partial<StreamState>) {
  const current = streamStore.get(messageId) || { content: '', status: 'streaming' as const };
  streamStore.set(messageId, { ...current, ...update });
  updateCounter++;
  if (updateCounter <= 5 || updateCounter % 20 === 0) {
    debugLog('[CHAT-DEBUG] updateStreamState', { messageId, update, updateCounter, storeSize: streamStore.size });
  }
  streamListeners.get(messageId)?.forEach((cb) => cb());
  streamVersion++;
  globalStreamListeners.forEach((cb) => cb());
}

// ---- Streaming ----

/** Tracks which message IDs have an active processStream in this tab */
export const activeStreams = new Set<string>();

export async function processStream(
  response: ReadableStream<Uint8Array>,
  messageId?: string,
  localThreadId?: string,
): Promise<string> {
  const tProcess = performance.now();
  let firstByteMs: number | null = null;
  let firstDeltaMs: number | null = null;
  debugLog('[TIMING] processStream entered', { messageId, hasLocalThread: !!localThreadId });
  const reader = response.getReader();
  const decoder = new TextDecoder();
  let done = false;
  let messageContent = '';
  let reasoningContent = '';
  let buffer = '';
  let lastLocalWrite = 0;
  let chunkCount = 0;
  const LOCAL_WRITE_INTERVAL = 300;

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    if (value) {
      if (firstByteMs === null) {
        firstByteMs = +(performance.now() - tProcess).toFixed(1);
        debugLog('[TIMING] processStream first byte', { ms: firstByteMs });
      }
      buffer += decoder.decode(value, { stream: true });
    }

    let newlineIndex = buffer.indexOf('\n');
    while (newlineIndex >= 0) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      newlineIndex = buffer.indexOf('\n');
      if (!line) continue;

      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (payload === '[DONE]') {
        debugLog('[CHAT-DEBUG] processStream [DONE] received');
        done = true;
        if (messageId) {
          updateStreamState(messageId, {
            status: 'done',
            content: messageContent,
            reasoning: reasoningContent || undefined,
          });
          updateLocalMessageById(localThreadId!, messageId, {
            status: 'done',
            content: messageContent,
            reasoning: reasoningContent || undefined,
          });
        }
        break;
      }
      let eventStreamDelta: any = null;
      try {
        eventStreamDelta = JSON.parse(payload);
      } catch {
        debugLog('[CHAT-DEBUG] processStream parse error for line:', line.slice(0, 100));
        continue;
      }
      const type = eventStreamDelta?.type as string | undefined;
      if (!type) continue;

      chunkCount++;
      if (chunkCount <= 5 || chunkCount % 20 === 0) {
        debugLog('[CHAT-DEBUG] processStream chunk', { type, chunkCount, contentLen: messageContent.length });
      }

      if (type === 'data-status') {
        const dataStatus = eventStreamDelta as {
          type: 'data-status';
          data: {
            status: 'streaming' | 'done' | 'error' | 'tool-call' | 'tool-done';
            error?: string;
            toolName?: string;
            toolResult?: object;
            toolCallId?: string;
          };
        };
        const status = dataStatus.data.status;
        debugLog('[CHAT-DEBUG] processStream data-status', { status, toolName: dataStatus.data.toolName });
        if (!messageId) continue;
        if (status === 'tool-call' && dataStatus.data.toolName) {
          const toolCall: NonNullable<Message['tools']>[number] = {
            id: dataStatus.data.toolCallId || crypto.randomUUID(),
            status: 'running',
            name: dataStatus.data.toolName,
            after: messageContent.length,
          };
          const currentTools = streamStore.get(messageId)?.tools || [];
          const toolIndex = currentTools.findIndex((t) => t.id === toolCall.id && t.status === 'running');
          if (toolIndex >= 0) {
            currentTools[toolIndex] = toolCall;
          } else {
            currentTools.push(toolCall);
          }
          updateStreamState(messageId, { tools: currentTools });
          updateLocalMessageById(localThreadId!, messageId, { tools: currentTools as any });
        }
        if (status === 'tool-done' && dataStatus.data.toolName && dataStatus.data.toolResult) {
          const toolOutput = {
            id: dataStatus.data.toolCallId || crypto.randomUUID(),
            status: 'done',
            name: dataStatus.data.toolName,
            result: dataStatus.data.toolResult,
            after: messageContent.length,
          } as const;
          const currentTools = streamStore.get(messageId)?.tools || [];
          const toolIndex = currentTools.findIndex((t) => t.id === toolOutput.id && t.status === 'running');
          if (toolIndex >= 0) {
            currentTools[toolIndex] = toolOutput as any;
          } else {
            currentTools.push(toolOutput as any);
          }
          updateStreamState(messageId, { tools: currentTools });
          updateLocalMessageById(localThreadId!, messageId, { tools: currentTools as any });
        }
      } else if (type === 'reasoning-delta') {
        const delta = (eventStreamDelta?.delta ?? '') as string;
        if (delta) {
          reasoningContent += delta;
          updateStreamState(messageId!, { reasoning: reasoningContent });
          updateLocalMessageById(localThreadId!, messageId!, { reasoning: reasoningContent });
        }
      } else if (type === 'start' || type === 'start-step' || type === 'text-start') {
        if (messageId) {
          updateStreamState(messageId, { status: 'streaming' });
        }
      } else if (type === 'text-delta') {
        const delta = (eventStreamDelta?.delta ?? '') as string;
        if (delta) {
          if (firstDeltaMs === null) {
            firstDeltaMs = +(performance.now() - tProcess).toFixed(1);
            debugLog('[TIMING] processStream first text-delta', { ms: firstDeltaMs, deltaLen: delta.length });
          }
          messageContent += delta;
          updateStreamState(messageId!, { content: messageContent });
          updateLocalMessageById(localThreadId!, messageId!, { content: messageContent });
        }
      } else if (type === 'finish-step') {
      } else if (type === 'finish') {
        debugLog('[CHAT-DEBUG] processStream finish event', {
          contentLen: messageContent.length,
          reasoningLen: reasoningContent.length,
        });
        done = true;
        if (messageId) {
          updateStreamState(messageId, {
            status: 'done',
            content: messageContent,
            reasoning: reasoningContent || undefined,
          });
          updateLocalMessageById(localThreadId!, messageId, {
            status: 'done',
            content: messageContent,
            reasoning: reasoningContent || undefined,
          });
        }
        break;
      } else if (type === 'error') {
        const errMsg =
          typeof eventStreamDelta?.errorText === 'string' ?
            eventStreamDelta.errorText
          : ((eventStreamDelta?.error?.message as string | undefined) ?? 'Unknown error');
        updateStreamState(messageId!, { status: 'error', content: errMsg });
        updateLocalMessageById(localThreadId!, messageId!, { content: errMsg, status: 'error' });
        break;
      }
    }
  }
  const result = messageContent.trim() === '' ? 'Error: No content received' : messageContent;
  debugLog('[CHAT-DEBUG] processStream done', { resultLen: result.length, totalChunks: chunkCount });
  return result;
}

let chatAbortController = new AbortController();
export function stopGeneration(reason?: string) {
  chatAbortController.abort(reason || 'Stopping Chat Stream...');
  chatAbortController = new AbortController();
}

export async function startStreaming({
  threadId,
  assistantMessageId,
  isSignedIn,
  convexThreadId,
  convexAssistantMessageId,
  systemPrompt,
  model,
  tools,
  messages: preFetchedMessages,
}: {
  threadId: string;
  assistantMessageId: string;
  isSignedIn: boolean;
  convexThreadId?: Id<'threads'>;
  convexAssistantMessageId?: Id<'messages'>;
  systemPrompt?: string;
  model: ModelID;
  tools?: CustomTools | undefined;
  messages?: Message[];
}) {
  const tStart = performance.now();
  debugLog('[TIMING] startStreaming entered', { threadId, assistantMessageId, isSignedIn, model });
  const signal = chatAbortController.signal;
  const system = systemPrompt ? systemPrompt.trim() : '';

  // Register this as an active stream so SSE reconnection skips it (before await to avoid race)
  activeStreams.add(assistantMessageId);

  debugLog('[TIMING] startStreaming fetching convex messages');
  const allMessages = preFetchedMessages ?? (await fetchConvexMessages(threadId));
  const messages = allMessages.map((m) => ({ role: m.role, content: m.content }));
  debugLog('[TIMING] fetchConvexMessages done', {
    count: allMessages.length,
    ms: +(performance.now() - tStart).toFixed(1),
  });

  try {
    debugLog('[TIMING] startStreaming calling aiGenerate');
    const tFetch = performance.now();
    const { data, error } = await aiGenerate(
      {
        model,
        system,
        messages,
        tools,
        convexThreadId: convexThreadId ?? undefined,
        convexAssistantMessageId: convexAssistantMessageId ?? undefined,
      },
      signal,
    );
    debugLog('[TIMING] aiGenerate returned', {
      ms: +(performance.now() - tFetch).toFixed(1),
      totalMs: +(performance.now() - tStart).toFixed(1),
    });
    if (error) {
      debugLog('[TIMING] startStreaming aiGenerate error', error);
      return;
    }
    const reader = data.body;
    if (!reader) {
      debugLog('[TIMING] startStreaming no response body reader');
      return;
    }

    debugLog('[TIMING] startStreaming starting processStream', { ms: +(performance.now() - tStart).toFixed(1) });
    await processStream(reader, assistantMessageId, !isSignedIn ? threadId : undefined);
    debugLog('[TIMING] processStream completed');
    if (!isSignedIn) {
      updateLocalMessageById(threadId, assistantMessageId, { status: 'done' });
    }
  } catch (e) {
    debugLog('[CHAT-DEBUG] startStreaming uncaught error', e);
    toast.error('Something went wrong during generation.');
  } finally {
    activeStreams.delete(assistantMessageId);
    debugLog('[CHAT-DEBUG] startStreaming cleanup done, activeStreams size:', activeStreams.size);
  }
}

export async function createMessage({
  threadId,
  userContent,
  model,
  systemPrompt,
  attachments,
  userId,
  tools,
  convexThreadId: preResolvedThreadId,
  convexAssistantMessageId: preCreatedAssistantId,
}: {
  threadId: string;
  userContent: string;
  model: ModelID;
  systemPrompt?: string;
  attachments?: string[];
  userId?: string;
  tools?: CustomTools;
  convexThreadId?: Id<'threads'>;
  convexAssistantMessageId?: Id<'messages'>;
}) {
  stopGeneration('Creating message, canceling any existing streams');

  const isSignedIn = !!userId;

  let assistantMessageId: string;
  if (preCreatedAssistantId) {
    assistantMessageId = preCreatedAssistantId;
  } else if (!isSignedIn) {
    assistantMessageId = addLocalMessage({
      threadId,
      role: 'assistant',
      content: '',
      status: 'streaming',
      model,
    });
    addLocalMessage({
      threadId,
      content: userContent,
      role: 'user',
      model,
      status: 'done',
      attachments,
    });
    updateLocalThread(threadId, { last_message_at: now(), updated_at: now() });
  } else {
    assistantMessageId = `${threadId}:assistant:${Date.now()}`;
  }

  let convexThreadId: Id<'threads'> | null = preResolvedThreadId ?? null;
  let convexAssistantMessageId: Id<'messages'> | null = preCreatedAssistantId ?? null;

  if (isSignedIn && !convexAssistantMessageId) {
    try {
      const client = getConvexClient();
      const isConvexId = threadId.length > 20 && !threadId.includes('-');
      convexThreadId = isConvexId ? (threadId as Id<'threads'>) : await ensureConvexThread(threadId, userId);

      if (convexThreadId) {
        await client.mutation(api.messages.create, {
          threadId: convexThreadId,
          content: userContent,
          role: 'user',
          model,
          userId,
          attachments,
          externalId: `${threadId}:user:${Date.now()}`,
        });
        convexAssistantMessageId = await client.mutation(api.messages.create, {
          threadId: convexThreadId,
          content: '',
          role: 'assistant',
          model,
          userId,
          externalId: `${threadId}:assistant:${Date.now()}`,
        });
        assistantMessageId = convexAssistantMessageId ?? assistantMessageId;
      }
    } catch (e) {
      console.log('[CHAT] Failed to create Convex messages:', e);
    }
  }

  await startStreaming({
    threadId,
    assistantMessageId,
    isSignedIn,
    convexThreadId: convexThreadId ?? undefined,
    convexAssistantMessageId: convexAssistantMessageId ?? undefined,
    systemPrompt,
    model,
    tools,
  });

  await generateTitle(threadId);

  if (EMBEDDING_ENABLED) {
    const userMessage: Message = {
      id: '',
      threadId,
      content: userContent,
      role: 'user',
      model,
      created_at: now(),
      updated_at: now(),
      status: 'done',
    };
    await checkMessageThreadEmbeddings(userMessage);
  }

  return assistantMessageId;
}

export async function updateMessage({
  message,
  newContent,
  model,
  systemPrompt,
  userId,
  tools,
  convexThreadId: preResolvedThreadId,
  convexAssistantMessageId: preCreatedAssistantId,
}: {
  message: Message;
  newContent: string;
  model: ModelID;
  systemPrompt?: string;
  userId?: string;
  tools?: CustomTools | undefined;
  convexThreadId?: Id<'threads'>;
  convexAssistantMessageId?: Id<'messages'>;
}) {
  stopGeneration('Updating message, canceling any existing streams');

  const isSignedIn = !!userId;
  const threadId = message.threadId;

  if (!isSignedIn) {
    updateLocalMessageById(threadId, message.id, { content: newContent, model });
    // Delete all messages after the edited message
    const allMsgs = getLocalMessages(threadId);
    const idx = allMsgs.findIndex((m) => m.id === message.id);
    if (idx >= 0) {
      saveLocalMessages(threadId, allMsgs.slice(0, idx + 1));
    }
  }

  let convexThreadId: Id<'threads'> | null = preResolvedThreadId ?? null;
  let convexAssistantMessageId: Id<'messages'> | null = preCreatedAssistantId ?? null;

  if (isSignedIn && !convexAssistantMessageId) {
    try {
      const client = getConvexClient();
      const isConvexId = threadId.length > 20 && !threadId.includes('-');
      convexThreadId = isConvexId ? (threadId as Id<'threads'>) : await ensureConvexThread(threadId, userId);

      if (convexThreadId) {
        convexAssistantMessageId = await client.mutation(api.messages.create, {
          threadId: convexThreadId,
          content: '',
          role: 'assistant',
          model,
          userId,
          externalId: `${threadId}:assistant:${Date.now()}`,
        });
      }
    } catch (e) {
      console.log('[CHAT] Failed to create Convex assistant message:', e);
    }
  }

  let assistantMessageId: string;
  if (convexAssistantMessageId) {
    assistantMessageId = convexAssistantMessageId;
  } else if (!isSignedIn) {
    assistantMessageId = addLocalMessage({
      threadId,
      role: 'assistant',
      content: '',
      status: 'streaming',
      model,
    });
  } else {
    assistantMessageId = `${threadId}:assistant:${Date.now()}`;
  }

  await startStreaming({
    threadId,
    assistantMessageId,
    isSignedIn,
    convexThreadId: convexThreadId ?? undefined,
    convexAssistantMessageId: convexAssistantMessageId ?? undefined,
    systemPrompt,
    model,
    tools,
  });

  await generateTitle(threadId);

  if (EMBEDDING_ENABLED) {
    const userMsg = { ...message, content: newContent, updated_at: now() };
    await checkMessageThreadEmbeddings(userMsg);
  }

  return assistantMessageId;
}

async function resolveConvexThreadId(threadId: string): Promise<string | null> {
  const isConvexId = threadId.startsWith('_') || (threadId.length > 20 && !threadId.includes('-'));
  if (isConvexId) return threadId;
  try {
    const client = getConvexClient();
    const thread = await client.query(api.threads.getByExternalId, { externalId: threadId });
    return thread?._id ?? null;
  } catch {
    return null;
  }
}

async function fetchConvexMessages(threadId: string): Promise<Message[]> {
  try {
    const convexId = await resolveConvexThreadId(threadId);
    if (!convexId) return getLocalMessages(threadId);
    const client = getConvexClient();
    for (let attempt = 0; attempt < 3; attempt++) {
      const msgs = await client.query(api.messages.getByThread, { threadId: convexId as any });
      const filtered = msgs
        .filter((m: any) => m.status !== 'deleted')
        .sort((a: any, b: any) => a._creationTime - b._creationTime)
        .map((m: any) => ({
          id: m._id,
          threadId: m.threadId,
          content: m.content,
          role: m.role,
          model: m.model,
          status: m.status,
          created_at: new Date(m.createdAt).toISOString(),
          updated_at: new Date(m.updatedAt).toISOString(),
          reasoning: m.reasoning,
          attachments: m.attachments,
          tools: m.tools,
        }));
      if (filtered.length > 0) return filtered;
      if (attempt < 2) await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
    }
    return getLocalMessages(threadId);
  } catch {}
  return getLocalMessages(threadId);
}

export async function generateTitle(threadId: string, prefetchedMessages?: Message[]) {
  // Try to get messages from Convex first, fall back to localStorage
  let allMessages: Message[];
  if (prefetchedMessages) {
    allMessages = prefetchedMessages;
  } else {
    try {
      const convexId = await resolveConvexThreadId(threadId);
      if (convexId) {
        const client = getConvexClient();
        const msgs = await client.query(api.messages.getByThread, { threadId: convexId as any });
        allMessages = msgs.map((m) => ({
          id: m._id,
          threadId: m.threadId,
          content: m.content,
          role: m.role,
          model: m.model,
          status: m.status,
          created_at: new Date(m.createdAt).toISOString(),
          updated_at: new Date(m.updatedAt).toISOString(),
          reasoning: m.reasoning,
          attachments: m.attachments,
          tools: m.tools,
        }));
      } else {
        allMessages = getLocalMessages(threadId);
      }
    } catch {
      allMessages = getLocalMessages(threadId);
    }
  }

  const newMessage = {
    role: 'user',
    content: 'Generate a short, concise title for this thread so far.',
  };
  const messages: ApiMessage[] = [
    ...allMessages.map((m) => ({ role: m.role, content: m.content })),
    newMessage as ApiMessage,
  ];
  const model: string = TITLE_MODEL;
  const system =
    'You are a short title generator. Your life depends on generating the shortest possible title. If the title exceeds 6 words, you will be terminated. Do not generate any text except for the title. Only include alphanumeric characters and spaces. You can not output any markdown formatting or special characters. You can only output characters from the english alphabet. For example, "Hello World" is a valid title, but "**Hello World!**" is not.';
  try {
    const { data, error } = await aiGenerate({ model, system, messages } as ChatFetchOptions);
    if (error) return toast.error('Failed to generate title!');
    if (!data.body) return toast.error('Failed to generate title!');
    const title = (await processStream(data.body)).split(/\s+/).slice(0, 6).join(' ');

    const titleConvexId = await resolveConvexThreadId(threadId);
    if (titleConvexId) {
      const client = getConvexClient();
      try {
        await client.mutation(api.threads.updateTitle, { id: titleConvexId as any, title });
      } catch {}
    } else {
      updateLocalThread(threadId, { title });
    }
  } catch (e) {
    console.log('Uncaught error', e);
    toast.error('Failed to generate title!');
  }
}

export async function checkMessageThreadEmbeddings(userMessage: Message): Promise<boolean> {
  try {
    return await checkEmbeddings(userMessage);
  } catch (error) {
    console.error('[CHAT] Error checking embeddings:', error);
    return false;
  }
}

// ---- Re-export local storage helpers for hooks ----
export { addLocalThread, deleteAllLocalData, deleteLocalThread, getLocalMessages, getLocalThreads, updateLocalThread };
