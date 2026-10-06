import { GenerationError } from './generation-errors';

export function generationErrorEvent(error: unknown) {
  return {
    error: true,
    message: error instanceof GenerationError ? error.message : 'AI generation failed.',
    code: error instanceof GenerationError ? error.code : 'AI_UNAVAILABLE',
    status: error instanceof GenerationError ? error.status : undefined,
  };
}

export const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
};

export function generationResponse(stream: AsyncIterable<{ content: string }>): Response {
  const encoder = new TextEncoder();
  let closed = false;
  return new Response(new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        if (!closed) controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };
      try {
        for await (const chunk of stream) {
          if (closed) break;
          if (chunk.content) send({ content: chunk.content, done: false });
        }
        send({ content: '', done: true });
      } catch (error) {
        send({ content: '', done: true, ...generationErrorEvent(error) });
      } finally {
        if (!closed) { closed = true; controller.close(); }
      }
    },
    cancel() { closed = true; },
  }), { headers: SSE_HEADERS });
}
