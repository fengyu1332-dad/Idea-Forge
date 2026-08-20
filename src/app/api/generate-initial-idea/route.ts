import { NextRequest } from 'next/server';
import { streamDeepSeek } from '@/lib/deepseek';
import { INITIAL_IDEA_PROMPT } from '@/config/experts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userInput } = await request.json();

    if (!userInput || typeof userInput !== 'string') {
      return new Response(JSON.stringify({ error: '请输入您的产品想法' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const messages = [
      { role: 'system' as const, content: INITIAL_IDEA_PROMPT },
      { role: 'user' as const, content: `请根据以下想法，构思一份完整的产品方案：\n\n${userInput}` },
    ];

    const stream = streamDeepSeek(messages, { temperature: 0.8 });

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
          const message = error instanceof Error ? error.message : String(error);
          console.error('Stream error:', error);
          if (!streamClosed) {
            streamClosed = true;
            try {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: '', done: true, error: true, message })}\n\n`));
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
    return new Response(JSON.stringify({ error: '生成失败，请重试' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
