import { run } from '@openai/agents';
import { chatAgent } from '@/lib/agent';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const input = messages.map((m: { role: string; content: string }) => ({
    type: 'message' as const,
    role: m.role as 'user' | 'assistant',
    content: m.role === 'assistant'
      ? [{ type: 'output_text' as const, text: m.content }]
      : [{ type: 'input_text' as const, text: m.content }],
  }));

  const result = await run(chatAgent, input, { stream: true });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of result) {
          if (event.type === 'raw_model_stream_event') {
            const data = event.data as Record<string, unknown>;
            if (data.type === 'output_text_delta') {
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    type: 'text_delta',
                    delta: (data as { delta: string }).delta,
                  }) + '\n',
                ),
              );
            }
          } else if (event.type === 'run_item_stream_event') {
            if (event.name === 'tool_called') {
              const item = event.item as {
                type: string;
                rawItem: {
                  call_id?: string;
                  name?: string;
                  arguments?: string;
                };
              };
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    type: 'tool_call_start',
                    toolCallId: item.rawItem.call_id ?? '',
                    toolName: item.rawItem.name ?? '',
                    arguments: item.rawItem.arguments ?? '',
                  }) + '\n',
                ),
              );
            } else if (event.name === 'tool_output') {
              const item = event.item as {
                type: string;
                rawItem: { call_id?: string; output?: string };
              };
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    type: 'tool_call_output',
                    toolCallId: item.rawItem.call_id ?? '',
                    output: item.rawItem.output ?? '',
                  }) + '\n',
                ),
              );
            }
          }
        }
        controller.enqueue(
          encoder.encode(JSON.stringify({ type: 'done' }) + '\n'),
        );
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              type: 'error',
              message: err instanceof Error ? err.message : 'Unknown error',
            }) + '\n',
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
