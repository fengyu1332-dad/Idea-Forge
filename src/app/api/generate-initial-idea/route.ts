import { NextRequest } from 'next/server';
import { streamDeepSeek } from '@/lib/deepseek';
import { buildInitialIdeaPrompt } from '@/config/experts';
import { initialRequest, invalidGenerationRequest } from '@/lib/generation-request';
import { generationResponse } from '@/lib/generation-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const parsed = initialRequest.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalidGenerationRequest();
  const { userInput, problemType, language } = parsed.data;
  return generationResponse(streamDeepSeek([
    { role: 'system', content: buildInitialIdeaPrompt(problemType, language) },
    { role: 'user', content: JSON.stringify({ userInput }) },
  ], { temperature: 0.5, maxTokens: 8192 }));
}
