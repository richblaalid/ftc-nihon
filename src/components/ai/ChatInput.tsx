'use client';

import { useRef, useEffect, type FormEvent, type ChangeEvent } from 'react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

/**
 * Chat input field with send button.
 * Supports large touch targets (44x44pt) for mobile use.
 * Users can use device's native voice input (keyboard microphone).
 */
export function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = 'Ask a question...',
  autoFocus = true,
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSubmit();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const canSubmit = value.trim().length > 0 && !disabled;

  return (
    <div className="border-t border-border bg-background px-4 py-3 pb-safe">
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 max-w-2xl mx-auto"
        data-testid="chat-input-form"
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          aria-label="Chat message input"
          data-testid="chat-input-field"
          className="flex-1 rounded-full bg-background-secondary px-4 py-3 text-sm text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={!canSubmit}
          aria-label="Send message"
          data-testid="chat-send-button"
          className="min-w-touch min-h-touch flex items-center justify-center rounded-full bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}
