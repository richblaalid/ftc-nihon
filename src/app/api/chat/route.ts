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

    // Return a user-friendly error
    return new Response(
      JSON.stringify({
        error: 'Failed to get AI response. Please try again.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
