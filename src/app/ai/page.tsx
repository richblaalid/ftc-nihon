'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { UIMessage } from 'ai';
import {
  ChatLayout,
  ChatMessage,
  ChatTypingIndicator,
  ChatInput,
} from '@/components/ai';
import { useSyncStore } from '@/stores/sync-store';
import {
  useCurrentActivity,
  useNextActivity,
  useActivities,
  useCurrentDayNumber,
  useAccommodationsForDay,
  useChatHistory,
  addChatMessage,
  clearChatHistory,
} from '@/db/hooks';
import { getCityForDay } from '@/lib/trip-dates';
import type { TripContext } from '@/lib/ai';
import type { ChatMessage as DBChatMessage } from '@/types/database';
import { findCachedResponse } from '@/db/seed-ai-cache';

/**
 * Convert a database chat message to a UIMessage for the useChat hook.
 */
function dbMessageToUIMessage(msg: DBChatMessage): UIMessage {
  return {
    id: msg.id,
    role: msg.role,
    parts: [{ type: 'text', text: msg.content }],
  };
}

/**
 * Extract text content from a UIMessage's parts.
 */
function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is Extract<typeof part, { type: 'text' }> => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

const chatTransport = new DefaultChatTransport({ api: '/api/chat' });

/**
 * AI Assistant chat page.
 * Uses the Vercel AI SDK useChat hook for streaming chat with Claude.
 */
export default function AIPage() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const historySeededRef = useRef(false);

  // Track online status
  const isOnline = useSyncStore((state) => state.isOnline);

  // Load persisted chat history from IndexedDB
  const chatHistory = useChatHistory(50);

  // Get trip context for AI
  const currentDay = useCurrentDayNumber();
  const currentActivity = useCurrentActivity();
  const nextActivity = useNextActivity();
  const todayActivities = useActivities(currentDay ?? undefined);
  const accommodations = useAccommodationsForDay(currentDay ?? 1);
  const currentCity = currentDay ? getCityForDay(currentDay) : null;

  // Build trip context
  const getTripContext = useCallback((): TripContext => ({
    currentDay,
    currentActivity: currentActivity ?? null,
    nextActivity: nextActivity ?? null,
    todayActivities: todayActivities ?? null,
    currentCity,
    accommodation: accommodations?.tonight ?? null,
  }), [currentDay, currentActivity, nextActivity, todayActivities, currentCity, accommodations]);

  // useChat hook — handles streaming, message state, stop
  const { messages, setMessages, sendMessage, status, stop } = useChat({
    transport: chatTransport,
    onFinish: async ({ message }) => {
      // Persist completed assistant message to IndexedDB
      const text = getMessageText(message);
      if (text) {
        await addChatMessage('assistant', text);
      }
    },
  });

  const isStreaming = status === 'streaming';
  const historyLoaded = chatHistory !== undefined;

  // Seed chat history from IndexedDB into useChat on first load
  useEffect(() => {
    if (historySeededRef.current) return;
    if (!chatHistory) return;
    historySeededRef.current = true;
    if (chatHistory.length > 0) {
      setMessages(chatHistory.map(dbMessageToUIMessage));
    }
  }, [chatHistory, setMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleClearHistory = async () => {
    if (window.confirm('Clear all chat history?')) {
      await clearChatHistory();
      setMessages([]);
    }
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isStreaming) return;

    // Persist user message to IndexedDB
    await addChatMessage('user', trimmedInput);

    if (!isOnline) {
      // Offline fallback — inject user message + cached response directly
      const userMsg: UIMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        parts: [{ type: 'text', text: trimmedInput }],
      };

      const cachedResponse = findCachedResponse(trimmedInput);
      const responseText = cachedResponse
        ?? 'I\'m currently offline and couldn\'t find a cached answer for your question. Try asking about:\n\n\u2022 Temple or restaurant etiquette\n\u2022 Common Japanese phrases (thank you, excuse me, etc.)\n\u2022 Practical tips (WiFi, bathrooms, money)\n\u2022 Emergency information\n\nOr try again when you have an internet connection!';

      const assistantMsg: UIMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        parts: [{ type: 'text', text: responseText }],
      };

      setMessages([...messages, userMsg, assistantMsg]);
      await addChatMessage('assistant', responseText);
      setInput('');
      return;
    }

    // Online — send via useChat with trip context
    setInput('');
    sendMessage(
      { text: trimmedInput },
      { body: { tripContext: getTripContext() } },
    );
  };

  return (
    <ChatLayout
      isOnline={isOnline}
      onClearHistory={messages.length > 0 ? handleClearHistory : undefined}
    >
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <EmptyState onSuggestionClick={setInput} />
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {isStreaming && (
              messages.length === 0 ||
              getMessageText(messages[messages.length - 1]!) === ''
            ) && (
              <ChatTypingIndicator />
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={handleSend}
        onStop={stop}
        isStreaming={isStreaming}
        disabled={!historyLoaded}
      />
    </ChatLayout>
  );
}

/**
 * Empty state with suggested questions.
 */
function EmptyState({ onSuggestionClick }: { onSuggestionClick: (text: string) => void }) {
  const suggestions = [
    'How do I say "thank you"?',
    'What\'s the etiquette at temples?',
    'What\'s on today\'s schedule?',
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="text-4xl mb-4">🗾</div>
      <h2 className="text-lg font-semibold text-foreground mb-2">
        Ask me anything about Japan!
      </h2>
      <p className="text-sm text-foreground-secondary max-w-xs">
        I can help with Japanese phrases, cultural etiquette, your itinerary, directions, and more.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSuggestionClick(suggestion)}
            className="px-3 py-2 text-sm bg-background-secondary rounded-full text-foreground-secondary hover:bg-background-tertiary transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
