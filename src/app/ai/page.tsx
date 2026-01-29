'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
} from '@/db/hooks';
import { getCityForDay } from '@/lib/trip-dates';
import type { TripContext } from '@/lib/ai';

/**
 * AI Assistant chat page.
 * Provides a conversational interface for trip-related questions.
 */
export default function AIPage() {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Track online status
  const isOnline = useSyncStore((state) => state.isOnline);

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
  }, [messages]);

  const handleSubmit = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    // Add user message
    const userMessage: ChatMessageData = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmedInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (!isOnline) {
        // Offline fallback - show cached response
        const offlineMessage: ChatMessageData = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: 'I\'m currently offline. Please try again when you have an internet connection, or ask about basic Japanese phrases and etiquette which I can answer from cached knowledge.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, offlineMessage]);
        return;
      }

      // Convert messages to UI format for API
      const uiMessages = [...messages, userMessage].map((m) => ({
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

      // Create assistant message that will be updated
      const assistantMessageId = `assistant-${Date.now()}`;
      let assistantContent = '';

      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        },
      ]);

      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          const chunk = decoder.decode(value);
          // Parse the data stream format (0: prefix for text)
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('0:')) {
              try {
                // The format is 0:"text content"
                const textContent = JSON.parse(line.slice(2));
                if (typeof textContent === 'string') {
                  assistantContent += textContent;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMessageId
                        ? { ...m, content: assistantContent }
                        : m
                    )
                  );
                }
              } catch {
                // Ignore parsing errors for non-text chunks
              }
            }
          }
        }
      }

      // If we didn't get any content, show an error
      if (!assistantContent) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId
              ? { ...m, content: 'Sorry, I couldn\'t generate a response. Please try again.' }
              : m
          )
        );
      }
    } catch (error) {
      console.error('[AI] Error:', error);
      const errorMessage: ChatMessageData = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatLayout isOnline={isOnline}>
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <EmptyState onSuggestionClick={setInput} />
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {isLoading && messages[messages.length - 1]?.content === '' && <ChatTypingIndicator />}

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
