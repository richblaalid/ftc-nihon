'use client';

import { memo } from 'react';

export interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: ChatMessageData;
}

/**
 * Individual chat message bubble component.
 * User messages appear on the right, assistant messages on the left.
 */
export const ChatMessage = memo(function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      data-testid={`chat-message-${message.role}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-primary text-white rounded-br-md'
            : 'bg-background-secondary text-foreground rounded-bl-md'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        <p
          className={`text-xs mt-1.5 ${
            isUser ? 'text-white/70' : 'text-foreground-tertiary'
          }`}
        >
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
});

/**
 * Typing indicator shown when AI is generating a response.
 */
export function ChatTypingIndicator() {
  return (
    <div className="flex justify-start" data-testid="chat-typing-indicator">
      <div className="bg-background-secondary rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1.5">
          <span
            className="w-2 h-2 bg-foreground-tertiary rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="w-2 h-2 bg-foreground-tertiary rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <span
            className="w-2 h-2 bg-foreground-tertiary rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
}
