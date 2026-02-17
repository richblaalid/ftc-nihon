'use client';

import { memo } from 'react';
import type { UIMessage } from 'ai';

interface ChatMessageProps {
  message: UIMessage;
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

/**
 * Individual chat message bubble component.
 * User messages appear on the right, assistant messages on the left.
 */
export const ChatMessage = memo(function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const text = getMessageText(message);

  if (!text) return null;

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
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{text}</p>
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
