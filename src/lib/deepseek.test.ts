import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { NextRequest } from 'next/server';
import { streamDeepSeek } from './deepseek';
import { POST } from '../app/api/generate-need-sensing/route';
import { readGenerationStream } from './generation-stream';

const originalFetch = globalThis.fetch;
const originalKey = process.env.DEEPSEEK_API_KEY;
const originalModel = process.env.DEEPSEEK_MODEL;
const originalError = console.error;
let calls = 0;
let logs: unknown[][] = [];
let handler: (body: Record<string, unknown>) => Response = () => { throw new Error('Unexpected network request'); };

// No real credentials or network calls are used in these regression tests.
globalThis.fetch = async (_input, init) => {
  calls++;
  return handler(JSON.parse(String(init?.body)));
};
console.error = (...args: unknown[]) => { logs.push(args); };

beforeEach(() => {
  calls = 0;
  logs = [];
  process.env.DEEPSEEK_API_KEY = 'test-key-not-a-real-secret';
  delete process.env.DEEPSEEK_MODEL;
});
after(() => {
  globalThis.fetch = originalFetch;
  console.error = originalError;
  if (originalKey === undefined) delete process.env.DEEPSEEK_API_KEY;
  else process.env.DEEPSEEK_API_KEY = originalKey;
  if (originalModel === undefined) delete process.env.DEEPSEEK_MODEL;
  else process.env.DEEPSEEK_MODEL = originalModel;
});

const messages = [{ role: 'user' as const, content: 'Test' }];
async function collect(): Promise<string> {
  let content = '';
  for await (const chunk of streamDeepSeek(messages)) content += chunk.content;
  return content;
}
function upstreamError(status: number): Response {
  return Response.json({ error: { message: 'Invalid key: test-key-not-a-real-secret' } }, { status });
}
function success(): Response {
  return new Response('data: {"choices":[{"delta":{"content":"OK"}}]}\n\ndata: [DONE]\n\n', {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}

test('uses the current model and disables thinking in the serialized provider request', async () => {
  handler = body => {
    // The provider no longer accepts the legacy deepseek-chat model name.
    if (body.model !== 'deepseek-flash') return upstreamError(400);
    assert.deepEqual(body.thinking, { type: 'disabled' });
    assert.equal(body.stream, true);
    assert.equal(body.max_tokens, 4096);
    return success();
  };
  assert.equal(await collect(), 'OK');
  process.env.DEEPSEEK_MODEL = '   ';
  assert.equal(await collect(), 'OK');
});

test('supports selecting another available model through the server environment', async () => {
  process.env.DEEPSEEK_MODEL = ' deepseek-v4-pro ';
  handler = body => {
    assert.equal(body.model, 'deepseek-v4-pro');
    return success();
  };
  assert.equal(await collect(), 'OK');
});

test('missing or blank API keys fail without contacting the provider', async () => {
  for (const key of [undefined, '   ']) {
    if (key === undefined) delete process.env.DEEPSEEK_API_KEY;
    else process.env.DEEPSEEK_API_KEY = key;
    await assert.rejects(collect(), { code: 'MISSING_API_KEY' });
  }
  assert.equal(calls, 0);
});

test('does not retry invalid credentials, exhausted balance or invalid parameters', async () => {
  for (const [status, code] of [[401, 'INVALID_API_KEY'], [402, 'INSUFFICIENT_BALANCE'], [400, 'INVALID_AI_REQUEST']] as const) {
    calls = 0;
    handler = () => upstreamError(status);
    await assert.rejects(collect(), { code, status });
    assert.equal(calls, 1);
  }
  assert.doesNotMatch(JSON.stringify(logs), /test-key-not-a-real-secret/);
});

test('retries a transient server failure before any content is delivered', async () => {
  handler = () => calls === 1 ? upstreamError(503) : success();
  assert.equal(await collect(), 'OK');
  assert.equal(calls, 2);
});

test('does not replay content when the provider stream fails after output', async () => {
  handler = () => new Response(
    'data: {"choices":[{"delta":{"content":"partial"}}]}\n\n'
      + 'data: {"error":{"message":"stream failed"}}\n\n',
    { headers: { 'Content-Type': 'text/event-stream' } },
  );
  const received: string[] = [];
  await assert.rejects(async () => {
    for await (const chunk of streamDeepSeek(messages)) received.push(chunk.content);
  }, { code: 'AI_UNAVAILABLE' });
  assert.equal(calls, 1);
  assert.deepEqual(received, ['partial']);
});

test('need-sensing route delivers a safe 401 reason through SSE to the client', async () => {
  handler = () => upstreamError(401);
  const request = new NextRequest('http://localhost/api/generate-need-sensing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userNeed: 'Help organize ideas', selectedMethodIds: ['triz'] }),
  });
  const response = await POST(request);
  assert.equal(response.status, 200);
  const wire = await response.text();
  assert.doesNotMatch(wire, /test-key-not-a-real-secret/);
  await assert.rejects(async () => {
    for await (const content of readGenerationStream(new Response(wire, { headers: response.headers }))) {
      assert.fail(`Unexpected content: ${content}`);
    }
  }, { code: 'INVALID_API_KEY', status: 401 });
  assert.equal(calls, 1);
});
