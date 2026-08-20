import OpenAI from 'openai';

let deepseek: OpenAI | null = null;

function getClient(): OpenAI {
  if (!deepseek) {
    deepseek = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com',
    });
  }
  return deepseek;
}

interface StreamChunk {
  content: string;
}

interface StreamOptions {
  temperature?: number;
  maxTokens?: number;
}

export async function* streamDeepSeek(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  options: StreamOptions = {},
): AsyncGenerator<StreamChunk> {
  const stream = await getClient().chat.completions.create({
    model: 'deepseek-chat',
    messages,
    temperature: options.temperature ?? 0.8,
    max_tokens: options.maxTokens ?? 4096,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield { content };
    }
  }
}
