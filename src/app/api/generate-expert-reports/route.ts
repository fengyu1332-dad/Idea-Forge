import { NextRequest } from 'next/server';
import { buildExpertPrompt, getExperts } from '@/config/experts';
import { streamDeepSeek } from '@/lib/deepseek';
import { expertReviewRequest, invalidGenerationRequest } from '@/lib/generation-request';
import { generationErrorEvent, SSE_HEADERS } from '@/lib/generation-response';
import { GenerationError } from '@/lib/generation-errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const parsed = expertReviewRequest.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalidGenerationRequest();
  const { userInput, initialIdea, problemType, language, expertIds } = parsed.data;
  const encoder = new TextEncoder();
  let closed = false;
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        if (!closed) controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };
      try {
        await Promise.allSettled(getExperts(problemType).filter(e => !expertIds || expertIds.includes(e.id)).map(async expert => {
          try {
            let content = '';
            for await (const chunk of streamDeepSeek([
              { role: 'system', content: buildExpertPrompt(expert.id, problemType, language) },
              { role: 'user', content: JSON.stringify({ userInput, initialAiDraft: initialIdea }) },
            ], { temperature: 0.4 })) {
              if (closed) return;
              content += chunk.content;
            }
            if (!content.trim()) throw new GenerationError('INVALID_RESPONSE', 'Empty review.');
            send({ expertId: expert.id, content, done: false });
          } catch (error) {
            send({ expertId: expert.id, done: false, ...generationErrorEvent(error) });
          }
        }));
        send({ done: true });
      } finally {
        if (!closed) { closed = true; controller.close(); }
      }
    },
    cancel() { closed = true; },
  });
  return new Response(stream, { headers: SSE_HEADERS });
}
