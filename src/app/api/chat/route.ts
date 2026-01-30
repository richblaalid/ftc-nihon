import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { buildSystemPrompt, createEmptyContext, type TripContext } from '@/lib/ai';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const runtime = 'edge';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, tripContext } = body as {
      messages: ChatMessage[];
      tripContext?: TripContext;
    };

    // Validate messages array
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No messages provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Chat API] Received messages:', JSON.stringify(messages, null, 2));

    // Build system prompt with trip context
    const systemPrompt = buildSystemPrompt(tripContext ?? createEmptyContext());

    // Convert UI messages to model format manually (avoiding convertToModelMessages issues)
    const modelMessages = messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    // Stream response from Claude
    const result = streamText({
      model: anthropic('claude-sonnet-4-20250514'),
      system: systemPrompt,
      messages: modelMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('[Chat API] Error:', error);

    // Extract error details
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error && 'cause' in error ? String(error.cause) : '';

    console.error('[Chat API] Details:', errorMessage, errorDetails);

    // Return a user-friendly error with details in dev
    return new Response(
      JSON.stringify({
        error: process.env.NODE_ENV === 'development'
          ? `AI Error: ${errorMessage}`
          : 'Failed to get AI response. Please try again.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
