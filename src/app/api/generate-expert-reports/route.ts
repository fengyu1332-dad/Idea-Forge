import { NextRequest } from 'next/server';
import { EXPERTS, EXPERT_PROMPTS } from '@/config/experts';
import { streamDeepSeek } from '@/lib/deepseek';
import { ExpertType } from '@/types';

export async function POST(request: NextRequest) {
  const { userInput, initialIdea } = await request.json();

  if (!userInput || !initialIdea) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const encoder = new TextEncoder();
  let streamClosed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        if (!streamClosed) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        }
      };

      try {
        // 并行启动5位专家的评审
        const expertPromises = EXPERTS.map(async (expert) => {
          const systemPrompt = EXPERT_PROMPTS[expert.id as ExpertType];
          const userMessage = `请对以下产品方案进行专业评审：

**用户原始想法**：
${userInput}

**初步构想**：
${initialIdea}

请从你的专业领域出发，给出你的意见。`;

          let fullContent = '';
          const generator = streamDeepSeek(
            [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage },
            ],
            { temperature: 0.9 },
          );

          for await (const chunk of generator) {
            fullContent += chunk.content;
          }

          return { expertId: expert.id, content: fullContent };
        });

        // 使用 allSettled 防止单个专家失败拖垮全部
        const results = await Promise.allSettled(expertPromises);
        let successCount = 0;
        for (const result of results) {
          if (result.status === 'fulfilled') {
            successCount++;
            send({ expertId: result.value.expertId, content: result.value.content, done: false });
          }
        }
        if (successCount === 0) {
          send({ error: 'All expert reports failed to generate' });
        }
        send({ done: true });
      } catch (error) {
        if (!streamClosed) {
          send({ error: 'Failed to generate expert reports' });
          controller.close();
        }
      } finally {
        if (!streamClosed) {
          controller.close();
        }
      }
    },
    cancel() {
      streamClosed = true;
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
