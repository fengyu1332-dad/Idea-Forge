import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { NextRequest } from 'next/server';
import { POST as initial } from '../app/api/generate-initial-idea/route';
import { POST as review } from '../app/api/generate-expert-reports/route';
import { POST as synthesis } from '../app/api/generate-synthesis/route';
import { POST as sense } from '../app/api/generate-need-sensing/route';
import { getExperts } from '../config/experts';
import { getSavedProblemType } from '../config/problem-types';
import { readGenerationEvents, readGenerationStream } from './generation-stream';
import type { ExpertReport, ExpertType } from '../types';

type ProviderBody = { messages: { role: string; content: string }[] };
const originalFetch = globalThis.fetch;
const originalKey = process.env.DEEPSEEK_API_KEY;
const originalError = console.error;
let calls: ProviderBody[] = [];
let failure: (body: ProviderBody) => boolean = () => false;

// Exercise real routes, provider serialization and stream readers without real API charges.
globalThis.fetch = async (_input, init) => {
  const body = JSON.parse(String(init?.body)) as ProviderBody;
  calls.push(body);
  if (failure(body)) return Response.json({ error: { message: 'Balance exhausted' } }, { status: 402 });
  const content = '- [RISK] Baseline evidence is missing. Measure it before setting an acceptance target.';
  return new Response(`data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\ndata: [DONE]\n\n`, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
};
console.error = () => {};
beforeEach(() => {
  calls = [];
  failure = () => false;
  process.env.DEEPSEEK_API_KEY = 'workflow-test-placeholder';
});
after(() => {
  globalThis.fetch = originalFetch;
  console.error = originalError;
  if (originalKey === undefined) delete process.env.DEEPSEEK_API_KEY;
  else process.env.DEEPSEEK_API_KEY = originalKey;
});

function request(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/test', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
}
async function consume(response: Response) {
  let text = '';
  for await (const chunk of readGenerationStream(response)) text += chunk;
  assert.ok(text.length);
}
async function events(response: Response) {
  const result = [];
  for await (const event of readGenerationEvents(response)) result.push(event);
  return result;
}

for (const problemType of ['product', 'engineering'] as const) {
  test(`${problemType}: the same mode reaches sensing, concept, five reviews and final plan`, async () => {
    const context = { problemType, language: 'en', userInput: problemType === 'engineering'
      ? 'Reduce fan noise without reducing airflow; no baseline measurements yet.'
      : 'Test whether freelancers will pay for automatic time tracking; no customer evidence yet.', initialIdea: 'Unvalidated draft' };
    const label = problemType === 'engineering' ? '当前需求类型：工程改进' : '当前需求类型：产品构思';
    await consume(await sense(request({ ...context, userNeed: context.userInput, selectedMethodIds: ['triz'], selectedMethodModes: { triz: 'pro' } })));
    assert.match(calls[0].messages[0].content, /启发式建议，未查矩阵/);
    assert.doesNotMatch(calls[0].messages[0].content, /推理出最可能被推荐的原理|必须完成ARIZ前5个阶段/);
    await consume(await initial(request(context)));
    const reports = await events(await review(request(context)));
    assert.deepEqual(reports.filter(e => e.expertId).map(e => e.expertId).sort(), getExperts(problemType).map(e => e.id).sort());
    assert.equal(reports.at(-1)?.done, true);
    assert.ok(reports.filter(e => e.expertId).every(e => !e.error && e.content));
    await consume(await synthesis(request({ ...context, expertReports: {} })));
    assert.equal(calls.length, 8);
    for (const call of calls) {
      assert.ok(call.messages[0].content.includes(label));
      assert.match(call.messages[0].content, /Write the entire user-facing response in English/);
      assert.match(call.messages[0].content, /用户提供，未核验/);
      assert.match(call.messages[0].content, /未调用联网搜索/);
    }
    const finalPrompt = calls.at(-1)!.messages[0].content;
    if (problemType === 'engineering') {
      assert.match(finalPrompt, /指标ID｜关联试验ID｜指标与单位｜基线/);
      assert.match(finalPrompt, /待负责人确认/);
      assert.doesNotMatch(finalPrompt, /## \d+\. (增长与变现|产品验证实验)/);
    } else {
      assert.match(finalPrompt, /## 4\. 产品验证实验/);
      assert.match(finalPrompt, /不把口头喜欢等同购买意愿/);
    }
  });
}

test('synthesis retains deselected and deleted original risks, plus evidence from sensing', async () => {
  const expertId: ExpertType = 'reliability-engineer';
  const report: ExpertReport = {
    expertId,
    opinions: [{ id: '1', expertType: expertId, checked: false, priority: 'low', content: 'UNCHECKED: guard may fail' }],
    rawContent: '- [RISK] DELETED: temperature limit is unverified',
  };
  await consume(await synthesis(request({
    problemType: 'engineering', userInput: 'Improve a fan', initialIdea: 'Draft',
    expertReports: { [expertId]: report },
    needSensingData: { analysisResult: 'EARLIER: unknown operating temperature' },
  })));
  const materials = calls[0].messages[1].content;
  assert.match(materials, /UNCHECKED: guard may fail/);
  assert.match(materials, /"userSelected":false/);
  assert.match(materials, /DELETED: temperature limit is unverified/);
  assert.match(materials, /EARLIER: unknown operating temperature/);
  assert.match(materials, /评审缺失/);
});

test('partial review failure reports the failed perspective and supports a targeted retry', async () => {
  failure = body => body.messages[0].content.includes('评审重点：设计与原方案比较的试验');
  const context = { problemType: 'engineering', userInput: 'Reduce fan noise', initialIdea: 'Draft' };
  const result = await events(await review(request(context)));
  assert.equal(result.filter(e => e.content).length, 4);
  const failed = result.filter(e => e.error);
  assert.equal(failed.length, 1);
  assert.equal(failed[0].expertId, 'test-engineer');
  assert.equal(failed[0].code, 'INSUFFICIENT_BALANCE');
  assert.equal(failed[0].status, 402);
  failure = () => false;
  calls = [];
  const retry = await events(await review(request({ ...context, expertIds: ['test-engineer'] })));
  assert.equal(calls.length, 1);
  assert.equal(retry.filter(e => e.content).length, 1);
  assert.equal(retry[0].expertId, 'test-engineer');
});

test('all failed reviews emit five errors, never a successful empty review', async () => {
  failure = () => true;
  const result = await events(await review(request({ problemType: 'product', userInput: 'Test a concept', initialIdea: 'Draft' })));
  assert.equal(result.filter(e => e.error).length, 5);
  assert.equal(result.filter(e => e.content).length, 0);
  assert.equal(result.at(-1)?.done, true);
});

test('invalid mode, malformed input and mixed-mode reviews are rejected before provider calls', async () => {
  for (const route of [initial, review, synthesis, sense]) {
    assert.equal((await route(request({ userInput: 'Need', userNeed: 'Need', initialIdea: 'Draft', problemType: 'unknown' }))).status, 400);
    assert.equal((await route(request(null))).status, 400);
  }
  assert.equal((await review(request({ userInput: 'Need', initialIdea: 'Draft', problemType: 'engineering', expertIds: ['market-analyst'] }))).status, 400);
  assert.equal((await synthesis(request({ userInput: 'Need', initialIdea: 'Draft', problemType: 'engineering', expertReports: {
    'market-analyst': { expertId: 'market-analyst', opinions: [], rawContent: 'Old product review' },
  } }))).status, 400);
  assert.equal(calls.length, 0);
});

test('legacy projects and requests default to product; explicit engineering survives reload normalization', async () => {
  assert.equal(getSavedProblemType(undefined), 'product');
  assert.equal(getSavedProblemType('engineering'), 'engineering');
  await consume(await initial(request({ userInput: 'Old saved product idea' })));
  assert.match(calls[0].messages[0].content, /当前需求类型：产品构思/);
});

test('provider errors remain actionable in initial and final stages', async () => {
  failure = () => true;
  for (const route of [initial, synthesis]) {
    await assert.rejects(consume(await route(request({ userInput: 'Need', initialIdea: 'Draft', problemType: 'engineering' }))), {
      code: 'INSUFFICIENT_BALANCE', status: 402,
    });
  }
});
