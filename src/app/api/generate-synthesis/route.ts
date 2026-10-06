import { NextRequest } from 'next/server';
import { streamDeepSeek } from '@/lib/deepseek';
import { buildSynthesisInput, buildSynthesisPrompt } from '@/config/synthesis';
import { synthesisRequest, invalidGenerationRequest } from '@/lib/generation-request';
import { generationResponse } from '@/lib/generation-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const parsed = synthesisRequest.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalidGenerationRequest();
  const input = parsed.data;
  return generationResponse(streamDeepSeek([
    { role: 'system', content: buildSynthesisPrompt(input.problemType, input.language) },
    { role: 'user', content: buildSynthesisInput(input) },
  ], { temperature: 0.4, maxTokens: 16384 }));
}
