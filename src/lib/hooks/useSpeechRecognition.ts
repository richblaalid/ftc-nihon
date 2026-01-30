'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Speech recognition hook return type
 */
export interface UseSpeechRecognitionReturn {
  /** Whether the browser supports speech recognition */
  isSupported: boolean;
  /** Whether currently listening for speech */
  isListening: boolean;
  /** The transcribed text from speech */
  transcript: string;
  /** Error message if something went wrong */
  error: string | null;
  /** Start listening for speech */
  startListening: () => void;
  /** Stop listening for speech */
  stopListening: () => void;
  /** Clear the transcript */
  resetTranscript: () => void;
}

/**
 * SpeechRecognition types for TypeScript
 * These match the Web Speech API spec
 */
interface ISpeechRecognitionResult {
  readonly transcript: string;
  readonly confidence: number;
}

interface ISpeechRecognitionResultList {
  readonly length: number;
  item(index: number): ISpeechRecognitionResult | null;
  [index: number]: { readonly [index: number]: ISpeechRecognitionResult | undefined; readonly isFinal: boolean };
}

interface ISpeechRecognitionEvent extends Event {
  readonly results: ISpeechRecognitionResultList;
  readonly resultIndex: number;
}

interface ISpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message?: string;
}

interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}

// Get the SpeechRecognition constructor (with webkit prefix fallback)
function getSpeechRecognition(): ISpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

/**
 * Map error codes to user-friendly messages
 */
function getErrorMessage(error: string): string {
  const errorMessages: Record<string, string> = {
    'not-allowed': 'Microphone access denied. Please enable in Settings.',
    'no-speech': 'No speech detected. Tap and speak clearly.',
    'network': 'Network error. Please try again.',
    'audio-capture': 'Microphone not available. Check device settings.',
    'aborted': 'Speech input was cancelled.',
    'service-not-allowed': 'Speech recognition service not available.',
    'language-not-supported': 'Language not supported.',
  };

  return errorMessages[error] || 'Speech recognition error. Please try again.';
}

/**
 * Hook for speech recognition using the Web Speech API.
 *
 * Features:
 * - Browser support detection
 * - Single-shot mode (auto-stops after speech ends)
 * - Comprehensive error handling
 * - Works on Safari iOS 14.5+, Chrome, Edge
 *
 * @param lang - Language for recognition (default: 'en-US')
 * @returns Speech recognition state and controls
 *
 * @example
 * ```tsx
 * const { isSupported, isListening, transcript, startListening, stopListening } = useSpeechRecognition();
 *
 * if (!isSupported) return <p>Voice input not supported</p>;
 *
 * return (
 *   <button onClick={isListening ? stopListening : startListening}>
 *     {isListening ? 'Stop' : 'Speak'}
 *   </button>
 * );
 * ```
 */
export function useSpeechRecognition(lang: string = 'en-US'): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  // Start as false to avoid hydration mismatch, check on mount
  const [isSupported, setIsSupported] = useState(false);

  // Store recognition instance in ref to persist across renders
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  // Check browser support on mount (client-side only)
  useEffect(() => {
    const SpeechRecognitionClass = getSpeechRecognition();
    setIsSupported(SpeechRecognitionClass !== null);
  }, []);

  // Initialize recognition instance
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();

    // Configure recognition
    recognition.lang = lang;
    recognition.continuous = false; // Single result mode
    recognition.interimResults = false; // Only final results
    recognition.maxAlternatives = 1;

    // Handle results
    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      if (event.results.length > 0) {
        const result = event.results[0];
        if (result && result[0]) {
          setTranscript(result[0].transcript);
        }
      }
    };

    // Handle errors
    recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
      console.error('[SpeechRecognition] Error:', event.error, event.message);
      setError(getErrorMessage(event.error));
      setIsListening(false);
    };

    // Handle start
    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    // Handle end
    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore errors during cleanup
        }
        recognitionRef.current = null;
      }
    };
  }, [isSupported, lang]);

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;

    setError(null);
    setTranscript('');

    try {
      recognitionRef.current.start();
    } catch (err) {
      // Handle "already started" error
      if (err instanceof Error && err.name === 'InvalidStateError') {
        console.warn('[SpeechRecognition] Already started');
      } else {
        console.error('[SpeechRecognition] Failed to start:', err);
        setError('Failed to start speech recognition.');
      }
    }
  }, [isListening]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;

    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.error('[SpeechRecognition] Failed to stop:', err);
    }
  }, [isListening]);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
