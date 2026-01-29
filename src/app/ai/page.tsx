'use client';

import { useState, useRef, useEffect } from 'react';
import {
  ChatLayout,
  ChatMessage,
  ChatTypingIndicator,
  ChatInput,
  type ChatMessageData,
} from '@/components/ai';
import { useSyncStore } from '@/stores/sync-store';

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
      // TODO: Implement actual API call in task 6.1.3
      // For now, show a placeholder response
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const assistantMessage: ChatMessageData = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: isOnline
          ? 'I\'m your FTC Nihon AI assistant! I\'ll help you with trip questions, Japanese phrases, directions, and more. (API integration coming soon)'
          : 'I\'m currently offline, so I can only answer questions from my cached knowledge. Try asking about Japanese etiquette, common phrases, or the itinerary!',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
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

            {isLoading && <ChatTypingIndicator />}

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
