'use client';

import { useRef, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useSpeechRecognition } from '@/lib/hooks/useSpeechRecognition';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

/**
 * Microphone icon component
 */
function MicrophoneIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
      />
    </svg>
  );
}

/**
 * Chat input field with send button and optional voice input.
 * Supports large touch targets (44x44pt) for mobile use.
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

  // Speech recognition hook
  const {
    isSupported: voiceSupported,
    isListening,
    transcript,
    error: voiceError,
    startListening,
    stopListening,
  } = useSpeechRecognition();

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  // When transcript changes, append to input
  useEffect(() => {
    if (transcript) {
      // Append transcript to existing value (with space if needed)
      const newValue = value ? `${value} ${transcript}` : transcript;
      onChange(newValue);
    }
  }, [transcript]); // eslint-disable-line react-hooks/exhaustive-deps -- Only react to transcript changes

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSubmit();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const canSubmit = value.trim().length > 0 && !disabled;

  return (
    <div className="border-t border-border bg-background px-4 py-3 pb-safe">
      {/* Voice error message */}
      {voiceError && (
        <div className="mb-2 text-xs text-error text-center animate-fade-in">
          {voiceError}
        </div>
      )}

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
          placeholder={isListening ? 'Listening...' : placeholder}
          disabled={disabled}
          aria-label="Chat message input"
          data-testid="chat-input-field"
          className="flex-1 rounded-full bg-background-secondary px-4 py-3 text-sm text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />

        {/* Microphone button - only show if supported */}
        {voiceSupported && (
          <button
            type="button"
            onClick={handleMicClick}
            disabled={disabled}
            aria-label={isListening ? 'Stop listening' : 'Start voice input'}
            data-testid="chat-mic-button"
            className={`min-w-touch min-h-touch flex items-center justify-center rounded-full transition-all ${
              isListening
                ? 'bg-primary text-white animate-pulse'
                : 'bg-background-secondary text-foreground-secondary hover:bg-background-tertiary'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <MicrophoneIcon />
          </button>
        )}

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
