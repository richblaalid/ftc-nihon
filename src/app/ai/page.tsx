'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  ChatLayout,
  ChatMessage,
  ChatTypingIndicator,
  ChatInput,
  type ChatMessageData,
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
 * Convert database chat message to component format
 */
function toMessageData(msg: DBChatMessage): ChatMessageData {
  return {
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: new Date(msg.timestamp),
  };
}

/**
 * AI Assistant chat page.
 * Provides a conversational interface for trip-related questions.
 */
export default function AIPage() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<ChatMessageData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Track online status
  const isOnline = useSyncStore((state) => state.isOnline);

  // Load persisted chat history from IndexedDB
  const chatHistory = useChatHistory(50);

  // Convert DB messages to component format
  const messages: ChatMessageData[] = useMemo(
    () => chatHistory?.map(toMessageData) ?? [],
    [chatHistory]
  );

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

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  const handleClearHistory = async () => {
    if (window.confirm('Clear all chat history?')) {
      await clearChatHistory();
    }
  };

  const handleSubmit = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    // Save user message to database
    const userMessage = await addChatMessage('user', trimmedInput);
    setInput('');
    setIsLoading(true);

    try {
      if (!isOnline) {
        // Offline fallback - try cached responses first
        const cachedResponse = findCachedResponse(trimmedInput);
        if (cachedResponse) {
          await addChatMessage('assistant', cachedResponse);
        } else {
          await addChatMessage(
            'assistant',
            'I\'m currently offline and couldn\'t find a cached answer for your question. Try asking about:\n\n• Temple or restaurant etiquette\n• Common Japanese phrases (thank you, excuse me, etc.)\n• Practical tips (WiFi, bathrooms, money)\n• Emergency information\n\nOr try again when you have an internet connection!'
          );
        }
        return;
      }

      // Get all messages including the new user message for API
      const allMessages = [...messages, toMessageData(userMessage)];
      const uiMessages = allMessages.map((m) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      // Call the API with streaming
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: uiMessages,
          tripContext: getTripContext(),
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      // Create streaming message state
      const streamingId = `streaming-${Date.now()}`;
      let assistantContent = '';

      setStreamingMessage({
        id: streamingId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      });

      const decoder = new TextDecoder();
      let done = false;
      let buffer = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          buffer += decoder.decode(value, { stream: true });
          // Parse SSE format: data: {"type":"text-delta","delta":"text"}
          const lines = buffer.split('\n');
          // Keep the last potentially incomplete line in buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('data: ')) {
              try {
                const json = JSON.parse(trimmedLine.slice(6));
                // Handle both possible field names: 'delta' or 'textDelta'
                const text = json.delta ?? json.textDelta;
                if (json.type === 'text-delta' && typeof text === 'string') {
                  assistantContent += text;
                  setStreamingMessage((prev) =>
                    prev ? { ...prev, content: assistantContent } : null
                  );
                }
              } catch {
                // Ignore parsing errors for non-JSON chunks
              }
            }
          }
        }
      }

      // Save the completed message to database
      if (assistantContent) {
        await addChatMessage('assistant', assistantContent);
      } else {
        await addChatMessage('assistant', 'Sorry, I couldn\'t generate a response. Please try again.');
      }

      // Clear streaming state
      setStreamingMessage(null);
    } catch (error) {
      console.error('[AI] Error:', error);
      await addChatMessage('assistant', 'Sorry, I encountered an error. Please try again.');
      setStreamingMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Combine persisted messages with streaming message
  const displayMessages = streamingMessage
    ? [...messages, streamingMessage]
    : messages;

  return (
    <ChatLayout
      isOnline={isOnline}
      onClearHistory={messages.length > 0 ? handleClearHistory : undefined}
    >
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {displayMessages.length === 0 ? (
          <EmptyState onSuggestionClick={setInput} />
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">
            {displayMessages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {isLoading && (!streamingMessage || streamingMessage.content === '') && (
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
        onSubmit={handleSubmit}
        disabled={isLoading}
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
