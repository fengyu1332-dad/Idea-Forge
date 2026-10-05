import OpenAI from 'openai';
import { GenerationError } from './generation-errors';

let deepseek: OpenAI | null = null;

function getClient(): OpenAI {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) {
    throw new GenerationError('MISSING_API_KEY', 'The server has no DeepSeek API key configured.');
  }
  if (!deepseek) {
    deepseek = new OpenAI({
      apiKey,
      baseURL: 'https://api.deepseek.com',
      // Retry in one place only; SDK retries would multiply the attempts below.
      maxRetries: 0,
      timeout: 60_000,
    });
  }
  return deepseek;
}

function toGenerationError(error: unknown): GenerationError {
  if (error instanceof GenerationError) return error;
  if (error instanceof OpenAI.APIConnectionTimeoutError) {
    return new GenerationError('AI_TIMEOUT', 'DeepSeek did not respond in time.');
  }
  const status = error instanceof OpenAI.APIError ? error.status : undefined;
  switch (status) {
    case 401:
      return new GenerationError('INVALID_API_KEY', 'The DeepSeek API key is invalid. Please contact the site administrator.', status);
    case 402:
      return new GenerationError('INSUFFICIENT_BALANCE', 'The DeepSeek API account has insufficient balance.', status);
    case 400:
    case 404:
    case 422:
      return new GenerationError('INVALID_AI_REQUEST', 'DeepSeek rejected the model or request parameters.', status);
    case 429:
      return new GenerationError('RATE_LIMITED', 'DeepSeek is receiving too many requests. Please try again later.', status);
    case 408:
    case 504:
      return new GenerationError('AI_TIMEOUT', 'DeepSeek did not respond in time.', status);
    default:
      // Never forward upstream messages: authentication errors may contain key fragments.
      return new GenerationError('AI_UNAVAILABLE', 'The AI service is temporarily unavailable.', status);
  }
}

function isRetryable(error: unknown): boolean {
  if (error instanceof OpenAI.APIConnectionError) return true;
  if (!(error instanceof OpenAI.APIError) || !error.status) return false;
  return [408, 409, 429].includes(error.status) || error.status >= 500;
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
      const request = {
        model: process.env.DEEPSEEK_MODEL?.trim() || 'deepseek-flash',
        messages,
        temperature: options.temperature ?? 0.8,
        max_tokens: options.maxTokens ?? 4096,
        stream: true as const,
        // New models enable thinking by default. Preserve the previous chat behavior
        // so the UI receives answer content without waiting through a reasoning phase.
        thinking: { type: 'disabled' as const },
      };
      const stream = await getClient().chat.completions.create(request);

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          hasYielded = true;
          yield { content };
        }
      }
      return;
    } catch (error) {
      const generationError = toGenerationError(error);
      lastError = generationError;
      // 一旦已输出内容后中途失败，重试会导致内容重复，直接抛出
      console.error(`DeepSeek stream attempt ${attempt}/${maxRetries} failed:`, {
        code: generationError.code,
        status: generationError.status,
      });
      if (hasYielded || !isRetryable(error)) throw lastError;
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** (attempt - 1)));
      }
    }
  }

  throw lastError;
}
