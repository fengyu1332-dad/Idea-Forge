import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readGenerationStream } from './generation-stream';
import { GenerationError, getGenerationErrorMessage } from './generation-errors';
import { t } from './i18n';

function responseFrom(text: string, byteSize = 1): Response {
  const bytes = new TextEncoder().encode(text);
  return new Response(new ReadableStream({
    start(controller) {
      for (let offset = 0; offset < bytes.length; offset += byteSize) {
        controller.enqueue(bytes.slice(offset, offset + byteSize));
      }
      controller.close();
    },
  }), { headers: { 'Content-Type': 'text/event-stream' } });
}

async function collect(response: Response): Promise<string> {
  let result = '';
  for await (const text of readGenerationStream(response)) result += text;
  return result;
}

test('preserves UTF-8 and JSON across arbitrary network boundaries', async () => {
  const sse = ': heartbeat\r\n\r\ndata: {"content":"创新方向💡","done":false}\r\n\r\n'
    + 'data: {"content":"ABC","done":false}\n\n'
    + 'data: {"content":"","done":true}\n\n';
  for (const size of [1, 2, 7, 32, 1024]) {
    assert.equal(await collect(responseFrom(sse, size)), '创新方向💡ABC');
  }
});

test('does not swallow a split error event that also marks the stream done', async () => {
  const response = responseFrom('data: {"error":true,"done":true,"code":"INVALID_API_KEY","status":401}\n\n');
  await assert.rejects(collect(response), (error: unknown) => {
    assert.ok(error instanceof GenerationError);
    assert.equal(error.code, 'INVALID_API_KEY');
    assert.match(getGenerationErrorMessage(error, key => t(key, 'en')), /API key is invalid.*401/);
    assert.match(getGenerationErrorMessage(error, key => t(key, 'zh')), /密钥无效.*401/);
    return true;
  });
});

test('retains delivered content but rejects a truncated stream as incomplete', async () => {
  const received: string[] = [];
  await assert.rejects(async () => {
    for await (const content of readGenerationStream(responseFrom('data: {"content":"partial"}\n\ndata: {"con'))) {
      received.push(content);
    }
  }, { code: 'STREAM_INTERRUPTED' });
  assert.deepEqual(received, ['partial']);
});

test('reports HTTP errors and platform timeout pages', async () => {
  await assert.rejects(collect(Response.json({ error: 'Please enter a need.' }, { status: 400 })), {
    code: 'HTTP_ERROR', status: 400, message: 'Please enter a need.',
  });
  await assert.rejects(collect(new Response('<html>timeout</html>', { status: 504 })), {
    code: 'AI_TIMEOUT', status: 504,
  });
});

test('rejects empty, malformed and non-stream responses instead of reporting success', async () => {
  for (const response of [
    responseFrom('data: {"done":true}\n\n'),
    responseFrom('data: {invalid}\n\n'),
    new Response('<html>login</html>'),
  ]) {
    await assert.rejects(collect(response), { code: 'INVALID_RESPONSE' });
  }
});
