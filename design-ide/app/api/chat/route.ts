import { streamText, convertToCoreMessages } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { tools } from '@/lib/ai/tools';
import { SYSTEM_PROMPT } from '@/lib/ai/prompts';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, projectId } = await req.json();

    const result = streamText({
      model: anthropic('claude-sonnet-4-20250514'),
      system: SYSTEM_PROMPT,
      messages: convertToCoreMessages(messages),
      tools,
      maxSteps: 10, // Allow multi-step for generating all 5 variants
      onStepFinish: async ({ toolCalls, toolResults }) => {
        // Log tool usage for debugging
        if (toolCalls && toolCalls.length > 0) {
          console.log(
            `[Project ${projectId}] Tool calls:`,
            toolCalls.map((tc) => tc.toolName)
          );
        }

        // In a production app, you would save variants to the database here
        // For now, we'll handle this on the client side
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
