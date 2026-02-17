import { anthropic } from '@ai-sdk/anthropic';
import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { buildSystemPrompt, createEmptyContext, type TripContext } from '@/lib/ai';

export const runtime = 'edge';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, tripContext } = body as {
      messages: UIMessage[];
      tripContext?: TripContext;
    };

    // Validate messages array
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No messages provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build system prompt with trip context
    const systemPrompt = buildSystemPrompt(tripContext ?? createEmptyContext());

    // Stream response from Claude
    const result = streamText({
      model: anthropic('claude-sonnet-4-20250514'),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('[Chat API] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Chat API] Details:', errorMessage);

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
