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
  const maxRetries = 3;
  let lastError: unknown;
  let hasYielded = false;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
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
          hasYielded = true;
          yield { content };
        }
      }
      return;
    } catch (error) {
      lastError = error;
      // 一旦已输出内容后中途失败，重试会导致内容重复，直接抛出
      if (hasYielded) throw error;
      console.error(`DeepSeek stream attempt ${attempt}/${maxRetries} failed:`, error);
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** (attempt - 1)));
      }
    }
  }

  throw lastError;
}
