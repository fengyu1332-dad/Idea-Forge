import { NextRequest } from 'next/server';
import { streamDeepSeek } from '@/lib/deepseek';
import { buildNeedSensingPrompt } from '@/config/need-sensing';
import { getAuthUser } from '@/lib/auth';
import { needRequest, invalidGenerationRequest } from '@/lib/generation-request';
import { generationResponse } from '@/lib/generation-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const parsed = needRequest.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalidGenerationRequest();
  const { userNeed, selectedMethodIds, customMethodPrompts, selectedMethodModes, problemType, language } = parsed.data;
  const user = await getAuthUser(request);
  const systemPrompt = buildNeedSensingPrompt(selectedMethodIds,
    user?.role === 'admin' ? customMethodPrompts : {}, selectedMethodModes, problemType, language);
  return generationResponse(streamDeepSeek([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: JSON.stringify({ userNeed }) },
  ], { temperature: 0.6, maxTokens: 16384 }));
}
