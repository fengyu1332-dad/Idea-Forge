import { NextRequest } from 'next/server';
import { streamDeepSeek } from '@/lib/deepseek';
import { buildNeedSensingPrompt } from '@/config/need-sensing';
import { getAuthUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    let { userNeed, selectedMethodIds, customMethodPrompts, selectedMethodModes } = await request.json();

    // 非管理员用户不能使用自定义 Prompt
    const user = await getAuthUser(request);
    if (user?.role !== 'admin') {
      customMethodPrompts = {};
    }

    if (!userNeed || typeof userNeed !== 'string') {
      return new Response(JSON.stringify({ error: '请描述您的需求或困惑' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 根据选择的方法论动态组装 system prompt
    const systemPrompt = buildNeedSensingPrompt(
      selectedMethodIds || [],
      customMethodPrompts || {},
      selectedMethodModes || {},
    );

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: `请分析以下需求/问题/困惑，给出创新方向：\n\n${userNeed}` },
    ];

    const stream = streamDeepSeek(messages, { temperature: 0.8, maxTokens: 16384 });

    const encoder = new TextEncoder();
    let streamClosed = false;

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (streamClosed) break;
            if (chunk.content) {
              const text = chunk.content.toString();
              const data = JSON.stringify({ content: text, done: false });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }

          if (!streamClosed) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: '', done: true })}\n\n`));
            controller.close();
          }
        } catch (error) {
          console.error('Stream error:', error);
          if (!streamClosed) {
            streamClosed = true;
            try {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: '', done: true, error: true })}\n\n`));
              controller.close();
            } catch {
              // controller already closed
            }
          }
        }
      },
      cancel() {
        streamClosed = true;
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: '分析失败，请重试' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
