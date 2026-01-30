# Voice Input for AI Chat Interface - Implementation Plan

## Overview

Add voice input capability to the AI chat interface using the Web Speech API (SpeechRecognition). This allows users to speak their questions instead of typing, which is especially useful on mobile devices.

## Technical Approach

### API Choice: Web Speech API

**Why Web Speech API (not a third-party service):**
- Native browser support - no API keys or costs
- Safari iOS 14.5+ supports `webkitSpeechRecognition`
- Works offline for on-device recognition (where available)
- Privacy - audio processed locally or by browser vendor
- Simple implementation - no server-side components needed

### Browser Compatibility

| Browser | Support |
|---------|---------|
| Safari iOS 14.5+ | `webkitSpeechRecognition` |
| Chrome | `webkitSpeechRecognition` |
| Edge | `webkitSpeechRecognition` |
| Firefox | Limited (no SpeechRecognition) |

Since the app targets iOS Safari (per PRD), we have good support.

### Implementation Strategy

1. **Create a reusable hook** (`useSpeechRecognition`) that encapsulates:
   - Browser support detection
   - Permission handling
   - Start/stop controls
   - Transcript state
   - Error handling

2. **Modify ChatInput component** to:
   - Add microphone button (toggles recording)
   - Show visual feedback when recording
   - Append transcribed text to input field

3. **UX Considerations**:
   - Single-shot mode (not continuous) - user taps to speak, releases to process
   - Visual indicator when listening (pulsing mic icon)
   - Error messages for permission denied or unsupported browsers
   - Graceful degradation - hide mic button if unsupported

## Architecture

```
src/
├── lib/
│   └── hooks/
│       └── useSpeechRecognition.ts   # New hook
└── components/
    └── ai/
        └── ChatInput.tsx              # Modified - add mic button
```

## Implementation Details

### 1. useSpeechRecognition Hook

```typescript
interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}
```

**Features:**
- Detects `webkitSpeechRecognition` or `SpeechRecognition`
- Sets language to `en-US` (primary) with fallback
- Single result mode (not continuous)
- Handles all error types with user-friendly messages
- Auto-stops after speech ends

### 2. ChatInput Modifications

**New Props:** None needed - hook manages state internally

**UI Changes:**
- Add microphone button between input and send button
- Button states:
  - Default: Mic icon (gray)
  - Listening: Pulsing mic icon (primary color)
  - Unsupported: Hidden
- When transcript received, append to existing input value

**Accessibility:**
- `aria-label` for mic button states
- Announce when listening starts/stops

### 3. Error Handling

| Error | User Message |
|-------|--------------|
| `not-allowed` | "Microphone access denied. Please enable in Settings." |
| `no-speech` | "No speech detected. Tap and speak clearly." |
| `network` | "Network error. Try again." |
| `audio-capture` | "Microphone not available." |
| Unsupported | Hide button (graceful degradation) |

## Tasks

### Phase 1: Hook Implementation
- [ ] 1.1 Create `useSpeechRecognition` hook with TypeScript types
- [ ] 1.2 Implement browser support detection
- [ ] 1.3 Implement start/stop/reset functions
- [ ] 1.4 Add comprehensive error handling
- [ ] 1.5 Add unit tests for hook

### Phase 2: UI Integration
- [ ] 2.1 Add microphone button to ChatInput
- [ ] 2.2 Implement listening state visual feedback (pulsing animation)
- [ ] 2.3 Wire up transcript to input field
- [ ] 2.4 Add error toast/message display
- [ ] 2.5 Hide button on unsupported browsers

### Phase 3: Polish
- [ ] 3.1 Add haptic feedback on iOS (if available)
- [ ] 3.2 Test on actual iOS device
- [ ] 3.3 Verify HTTPS requirement works on Vercel
- [ ] 3.4 Update ChatInput tests

## Security & Privacy

- Requires HTTPS (Vercel provides this)
- User must grant microphone permission
- Audio processed by browser/OS speech service
- No audio sent to our servers

## Constraints

- Safari requires user gesture to start recognition
- Cannot run in background
- May not work in PWA standalone mode on some devices (needs testing)

## Rollback Plan

If issues arise:
- Mic button can be hidden via feature flag
- Hook is isolated - easy to remove
- No changes to core chat functionality
