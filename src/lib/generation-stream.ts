import { GenerationError, type GenerationErrorCode } from './generation-errors';

interface GenerationEvent {
  content?: string;
  done?: boolean;
  error?: boolean | string;
  message?: string;
  code?: GenerationErrorCode;
  status?: number;
}

/** Read our SSE protocol without assuming a network chunk is a complete event. */
export async function* readGenerationStream(response: Response): AsyncGenerator<string> {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = typeof body?.message === 'string' ? body.message
      : typeof body?.error === 'string' ? body.error : 'Generation request failed.';
    throw new GenerationError(
      response.status === 504 ? 'AI_TIMEOUT' : 'HTTP_ERROR', message, response.status,
    );
  }
  if (!response.headers.get('content-type')?.includes('text/event-stream') || !response.body) {
    throw new GenerationError('INVALID_RESPONSE', 'Expected an AI event stream.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let completed = false;
  let hasContent = false;

  try {
    while (!completed) {
      const { done, value } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      let boundary: number;
      while ((boundary = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, boundary).trimEnd();
        buffer = buffer.slice(boundary + 1);
        if (!line.startsWith('data:')) continue;

        let event: GenerationEvent;
        try {
          event = JSON.parse(line.slice(5).trimStart());
          if (!event || typeof event !== 'object') throw new Error('Invalid event');
        } catch {
          throw new GenerationError('INVALID_RESPONSE', 'The AI stream contains an invalid event.');
        }
        // Error events also carry done: true; handle the error first.
        if (event.error) {
          throw new GenerationError(event.code || 'AI_UNAVAILABLE', event.message || 'AI generation failed.', event.status);
        }
        if (typeof event.content === 'string' && event.content) {
          hasContent = true;
          yield event.content;
        }
        if (event.done) {
          completed = true;
          break;
        }
      }
      if (done) break;
    }
    if (!completed) throw new GenerationError('STREAM_INTERRUPTED', 'The AI stream ended before completion.');
    if (!hasContent) throw new GenerationError('INVALID_RESPONSE', 'The AI response was empty.');
  } catch (error) {
    if (error instanceof GenerationError) throw error;
    throw new GenerationError('STREAM_INTERRUPTED', 'The AI stream was interrupted.');
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
