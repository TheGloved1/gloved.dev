'use client';
import { CustomTools, ModelID } from '@/lib/ai';
import {
  activeStreams,
  addLocalThread,
  createMessage,
  deleteLocalThread,
  generateTitle,
  getLocalMessages,
  getLocalThreads,
  getStreamState,
  Message,
  startStreaming,
  stopGeneration,
  subscribeToAllStreams,
  subscribeToStream,
  Thread,
  updateMessage,
  updateStreamState,
} from '@/lib/chat-store';
import { debugLog, diagLog } from '@/lib/debug';
import { useUser } from '@clerk/nextjs';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { useConvex, useMutation, useQuery } from 'convex/react';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

/**
 * Returns threads for the current user.
 * Signed-in: Convex query (reactive)
 * Signed-out: localStorage (read on mount, no reactivity)
 */
export function useThreads(): { threads: Thread[]; isLoading: boolean } {
  const { isSignedIn, user, isLoaded } = useUser();
  const convexResult = useQuery(api.threads.getByUser, isSignedIn ? { userId: user!.id } : 'skip');

  // For signed-out, read from localStorage
  const [localThreads, setLocalThreads] = useState<Thread[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      setLocalThreads(getLocalThreads());
      setLoaded(true);
    }
  }, [isSignedIn]);

  if (isSignedIn) {
    const threads: Thread[] | undefined = convexResult?.map((t) => ({
      id: t._id,
      title: t.title,
      created_at: new Date(t.createdAt).toISOString(),
      updated_at: new Date(t.updatedAt).toISOString(),
      last_message_at: new Date(t.lastMessageAt).toISOString(),
      status: t.status,
    }));
    return { threads: threads ?? [], isLoading: (threads === undefined && !convexResult) || !isLoaded };
  }

  return { threads: localThreads, isLoading: !loaded };
}

/**
 * Returns messages for a given thread.
 * When the thread ID is a Convex ID (starts with underscore pattern), uses Convex.
 * Otherwise uses localStorage or externalId lookup.
 */
export function useThreadMessages(threadId: string): { messages: Message[]; isLoading: boolean } {
  const { isSignedIn, isLoaded } = useUser();
  const isConvexId = threadId.startsWith('_') || (threadId.length > 20 && !threadId.includes('-'));

  const convexQuery = useQuery(
    api.messages.getByThread,
    isSignedIn && isConvexId ? { threadId: threadId as Id<'threads'> } : 'skip',
  );

  const [localMsgs, setLocalMsgs] = useState<Message[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [streamVersion, setStreamVersion] = useState(0);

  useEffect(() => {
    if (!isSignedIn || !isConvexId) {
      setLocalMsgs(getLocalMessages(threadId));
      setLoaded(true);
    }
  }, [threadId, isSignedIn, isConvexId]);

  useEffect(() => subscribeToAllStreams(() => setStreamVersion((v) => v + 1)), []);

  // Merge streaming state into the message list
  const messages = useMemo(() => {
    let base: Message[];
    if (isSignedIn && isConvexId) {
      if (!convexQuery) {
        debugLog('[CHAT-DEBUG] useThreadMessages convexQuery undefined (loading)');
        return [];
      }
      base = convexQuery
        .slice()
        .sort((a, b) => a._creationTime - b._creationTime)
        .map((m) => ({
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
      if (base.length > 0) {
        debugLog('[CHAT-DEBUG] useThreadMessages convexQuery has messages', {
          count: base.length,
          statuses: base.map((m) => `${m.role}:${m.status}`),
        });
      }
    } else {
      base = [...localMsgs].sort((a, b) => {
        const timeCmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        if (timeCmp !== 0) return timeCmp;
        return a.role === 'assistant' ? 1 : -1;
      });
    }

    // Overlay streaming state: find the last assistant that has active streaming
    let mutated = false;
    const result = base.map((msg) => {
      if (msg.role !== 'assistant') return msg;
      const streamState = getStreamState(msg.id);
      if (!streamState) return msg;
      mutated = true;
      return {
        ...msg,
        content: streamState.content,
        reasoning: streamState.reasoning,
        status: streamState.status,
        tools: streamState.tools,
      };
    });
    if (mutated) {
      debugLog('[CHAT-DEBUG] useThreadMessages overlaid stream state on messages');
    }
    return mutated ? result : base;
  }, [convexQuery, localMsgs, isSignedIn, isConvexId, threadId, streamVersion]);

  const isLoading = (isSignedIn && isConvexId ? convexQuery === undefined : false) || !isLoaded;

  // Resume SSE connections for messages still streaming (page refresh, other tabs)
  const resumedRef = useRef<Set<string>>(new Set());
  const activeSseRef = useRef<Map<string, AbortController>>(new Map());
  const effectCountRef = useRef(0);

  useEffect(() => {
    const effectId = ++effectCountRef.current;
    const streamingMsgs = messages.filter((m) => m.role === 'assistant' && m.status === 'streaming');
    diagLog('effect-running', {
      effectId,
      msgCount: messages.length,
      streamingCount: streamingMsgs.length,
      activeStreamsSize: activeStreams.size,
      resumedCount: resumedRef.current.size,
      activeSseCount: activeSseRef.current.size,
    });

    messages.forEach((m) => {
      diagLog('effect-msg', {
        effectId,
        id: m.id,
        role: m.role,
        status: m.status,
        contentLen: m.content.length,
        idHasDash: m.id.includes('-'),
      });
    });

    for (const [mid, ctrl] of activeSseRef.current) {
      if (!streamingMsgs.some((m) => m.id === mid)) {
        diagLog('aborting-sse', { mid });
        ctrl.abort();
        activeSseRef.current.delete(mid);
        resumedRef.current.delete(mid);
      }
    }

    for (const msg of streamingMsgs) {
      if (msg.id.includes('-')) {
        diagLog('skip', { reason: 'fake-id', msgId: msg.id });
        continue;
      }
      if (activeStreams.has(msg.id)) {
        diagLog('skip', { reason: 'active-stream', msgId: msg.id });
        continue;
      }
      if (resumedRef.current.has(msg.id)) {
        diagLog('skip', { reason: 'already-resumed', msgId: msg.id });
        continue;
      }
      diagLog('connecting', { msgId: msg.id });
      resumedRef.current.add(msg.id);

      const controller = new AbortController();
      activeSseRef.current.set(msg.id, controller);

      const connect = async () => {
        const sseStart = performance.now();
        let sseFirstEvent = true;
        let totalEvents = 0;
        try {
          diagLog('fetch-start', { msgId: msg.id });
          const res = await fetch(`/api/chat/stream/${msg.id}`, { signal: controller.signal });
          diagLog('fetch-response', {
            msgId: msg.id,
            ok: res.ok,
            status: res.status,
            statusText: res.statusText,
            ms: +(performance.now() - sseStart).toFixed(1),
          });
          if (!res.ok || !res.body) {
            diagLog('fetch-fail', { ok: res.ok, hasBody: !!res.body, msgId: msg.id });
            return;
          }
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { value, done } = await reader.read();
            if (done) {
              diagLog('reader-done', { msgId: msg.id, totalEvents });
              break;
            }
            buffer += decoder.decode(value, { stream: true });

            let nlIdx;
            while ((nlIdx = buffer.indexOf('\n')) >= 0) {
              const line = buffer.slice(0, nlIdx).trim();
              buffer = buffer.slice(nlIdx + 1);
              if (!line.startsWith('data:')) continue;
              const payload = line.slice(5).trim();
              try {
                const ev = JSON.parse(payload);
                totalEvents++;
                if (sseFirstEvent && ev.type !== 'ping') {
                  sseFirstEvent = false;
                  diagLog('first-event', {
                    msgId: msg.id,
                    type: ev.type,
                    ms: +(performance.now() - sseStart).toFixed(1),
                  });
                }
                if (ev.type === 'resume') {
                  diagLog('event-resume', {
                    msgId: msg.id,
                    contentLen: ev.content?.length,
                    status: ev.status,
                    hasReasoning: !!ev.reasoning,
                  });
                  updateStreamState(msg.id, { content: ev.content, reasoning: ev.reasoning, status: ev.status });
                } else if (ev.type === 'update') {
                  diagLog('event-update', {
                    msgId: msg.id,
                    contentLen: ev.content?.length,
                    status: ev.status,
                    hasReasoning: !!ev.reasoning,
                  });
                  updateStreamState(msg.id, { content: ev.content, reasoning: ev.reasoning, status: ev.status });
                } else if (ev.type === 'done') {
                  diagLog('event-done', { msgId: msg.id, contentLen: ev.content?.length });
                  updateStreamState(msg.id, { content: ev.content, reasoning: ev.reasoning, status: 'done' });
                } else if (ev.type === 'error') {
                  diagLog('event-error', { msgId: msg.id, error: ev.error });
                  updateStreamState(msg.id, { content: ev.content, reasoning: ev.reasoning, status: 'error' });
                } else if (ev.type === 'ping') {
                  // silent
                } else {
                  diagLog('event-unknown', { msgId: msg.id, type: ev.type, payload });
                }
              } catch (parseErr) {
                diagLog('parse-error', { msgId: msg.id, line: line.slice(0, 80) });
              }
            }
          }
        } catch (err) {
          diagLog('connection-error', { msgId: msg.id, err: String(err) });
        } finally {
          activeSseRef.current.delete(msg.id);
          diagLog('cleanup', { msgId: msg.id, totalEvents });
        }
      };

      connect();
    }
  }, [messages]);

  return { messages, isLoading };
}

/**
 * Creates a new thread. Returns the thread ID (UUID for signed-out, Convex _id for signed-in).
 */
export function useCreateThread() {
  const { isSignedIn, user } = useUser();
  const convexCreate = useMutation(api.threads.create);

  return useCallback(async () => {
    if (isSignedIn && user) {
      const id = await convexCreate({ title: 'New Chat', userId: user.id });
      return id;
    }
    return addLocalThread();
  }, [isSignedIn, user, convexCreate]);
}

/**
 * Deletes a thread.
 */
export function useDeleteThread() {
  const { isSignedIn } = useUser();
  const convexRemove = useMutation(api.threads.remove);

  return useCallback(
    async (id: string) => {
      if (isSignedIn) {
        try {
          await convexRemove({ id: id as Id<'threads'> });
        } catch {
          deleteLocalThread(id);
        }
      } else {
        deleteLocalThread(id);
      }
    },
    [isSignedIn, convexRemove],
  );
}

/**
 * Subscribe to streaming message updates for real-time display.
 */
export function useStreamingMessage(messageId: string | undefined) {
  const subscribe = useCallback(
    (callback: () => void) => {
      if (!messageId) return () => {};
      return subscribeToStream(messageId, callback);
    },
    [messageId],
  );

  const getSnapshot = useCallback(() => {
    if (!messageId) return undefined;
    return getStreamState(messageId);
  }, [messageId]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useCreateMessage() {
  const { isSignedIn, user } = useUser();
  const convex = useConvex();
  const createPair = useMutation(api.messages.createPair).withOptimisticUpdate((localStore, args) => {
    const msgs = localStore.getQuery(api.messages.getByThread, { threadId: args.threadId });
    if (msgs === undefined) return;

    const nowMs = Date.now();

    localStore.setQuery(api.messages.getByThread, { threadId: args.threadId }, [
      ...msgs,
      {
        _id: crypto.randomUUID() as Id<'messages'>,
        _creationTime: nowMs,
        threadId: args.threadId,
        content: args.userContent,
        role: args.userRole,
        model: args.model,
        status: 'done' as const,
        createdAt: nowMs,
        updatedAt: nowMs,
        userId: args.userId,
        attachments: args.attachments,
        reasoning: undefined,
        tools: undefined,
        externalId: undefined,
      },
      {
        _id: crypto.randomUUID() as Id<'messages'>,
        _creationTime: nowMs + 1,
        threadId: args.threadId,
        content: '',
        role: 'assistant' as const,
        model: args.model,
        status: 'streaming' as const,
        createdAt: nowMs + 1,
        updatedAt: nowMs + 1,
        userId: args.userId,
        attachments: undefined,
        reasoning: undefined,
        tools: undefined,
        externalId: undefined,
      },
    ]);
  });

  return useCallback(
    async (params: {
      threadId: string;
      userContent: string;
      model: ModelID;
      systemPrompt?: string;
      attachments?: string[];
      tools?: CustomTools;
    }) => {
      const { threadId, userContent, model, systemPrompt, attachments, tools } = params;
      const userId = user?.id;

      if (!isSignedIn) {
        return createMessage({ threadId, userContent, model, systemPrompt, attachments, tools, userId: undefined });
      }

      debugLog('[CHAT-DEBUG] useCreateMessage entered', { threadId, userContent: userContent.slice(0, 50), model });

      stopGeneration('Creating message...');

      debugLog('[CHAT-DEBUG] useCreateMessage calling createPair mutation');
      const pairResult = await createPair({
        threadId: threadId as Id<'threads'>,
        userContent,
        userRole: 'user',
        model,
        userId,
        attachments,
      });
      const assistantId = pairResult.assistantId;
      debugLog('[CHAT-DEBUG] useCreateMessage createPair done', { assistantId });

      // Fetch messages via the React Convex client (has Clerk auth) to avoid auth issues
      let messages: Message[] = [];
      try {
        const raw = await convex.query(api.messages.getByThread, { threadId: threadId as Id<'threads'> });
        messages = (raw as any[])
          .slice()
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
      } catch (e) {
        debugLog('[CHAT-DEBUG] useCreateMessage convex.query failed', e);
      }

      // Fire-and-forget: streaming and title gen continue after navigation
      debugLog('[CHAT-DEBUG] useCreateMessage firing startStreaming');
      startStreaming({
        threadId,
        assistantMessageId: assistantId,
        isSignedIn: true,
        convexThreadId: threadId as Id<'threads'>,
        convexAssistantMessageId: assistantId as Id<'messages'>,
        systemPrompt,
        model,
        tools,
        messages,
      }).catch(() => {});

      generateTitle(threadId, messages).catch(() => {});

      debugLog('[CHAT-DEBUG] useCreateMessage returning');
      return assistantId;
    },
    [isSignedIn, user, createPair, convex],
  );
}

export function useUpdateMessage() {
  const { isSignedIn, user } = useUser();
  const convex = useConvex();

  const editMessage = useMutation(api.messages.editMessage).withOptimisticUpdate((localStore, args) => {
    const msgs = localStore.getQuery(api.messages.getByThread, { threadId: args.threadId });
    if (msgs === undefined) return;

    const nowMs = Date.now();
    const userMsgIdx = msgs.findIndex((m) => m._id === args.userMessageId);
    if (userMsgIdx === -1) return;

    localStore.setQuery(api.messages.getByThread, { threadId: args.threadId }, [
      ...msgs.slice(0, userMsgIdx + 1).map((m) => (m._id === args.userMessageId ? { ...m, content: args.newContent } : m)),
      {
        _id: crypto.randomUUID() as Id<'messages'>,
        _creationTime: nowMs + 1,
        threadId: args.threadId,
        content: '',
        role: 'assistant' as const,
        model: args.model,
        status: 'streaming' as const,
        createdAt: nowMs + 1,
        updatedAt: nowMs + 1,
        userId: args.userId,
        attachments: undefined,
        reasoning: undefined,
        tools: undefined,
        externalId: undefined,
      },
    ]);
  });

  return useCallback(
    async (params: { message: Message; newContent: string; model: ModelID; systemPrompt?: string; tools?: CustomTools }) => {
      const { message, newContent, model, systemPrompt, tools } = params;
      const userId = user?.id;

      if (!isSignedIn) {
        return updateMessage({ message, newContent, model, systemPrompt, userId: undefined });
      }

      stopGeneration('Updating message...');
      const threadId = message.threadId;

      const result = await editMessage({
        userMessageId: message.id as Id<'messages'>,
        threadId: threadId as Id<'threads'>,
        newContent,
        model,
        userId,
      });
      const assistantId = result.assistantId;

      // Fetch messages via the React Convex client (has Clerk auth) to avoid auth issues
      let messages: Message[] = [];
      try {
        const raw = await convex.query(api.messages.getByThread, { threadId: threadId as Id<'threads'> });
        messages = (raw as any[])
          .slice()
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
      } catch (e) {
        debugLog('[CHAT-DEBUG] useUpdateMessage convex.query failed', e);
      }

      startStreaming({
        threadId,
        assistantMessageId: assistantId,
        isSignedIn: true,
        convexThreadId: threadId as Id<'threads'>,
        convexAssistantMessageId: assistantId as Id<'messages'>,
        systemPrompt,
        model,
        tools,
        messages,
      }).catch(() => {});

      generateTitle(threadId, messages).catch(() => {});

      return assistantId;
    },
    [isSignedIn, user, editMessage, convex],
  );
}
