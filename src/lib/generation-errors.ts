export type GenerationErrorCode =
  | 'MISSING_API_KEY'
  | 'INVALID_API_KEY'
  | 'INSUFFICIENT_BALANCE'
  | 'INVALID_AI_REQUEST'
  | 'RATE_LIMITED'
  | 'AI_TIMEOUT'
  | 'AI_UNAVAILABLE'
  | 'STREAM_INTERRUPTED'
  | 'INVALID_RESPONSE'
  | 'HTTP_ERROR';

export class GenerationError extends Error {
  constructor(
    public readonly code: GenerationErrorCode,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'GenerationError';
  }
}

const errorKeys: Record<GenerationErrorCode, string> = {
  MISSING_API_KEY: 'error.missingApiKey',
  INVALID_API_KEY: 'error.invalidApiKey',
  INSUFFICIENT_BALANCE: 'error.insufficientBalance',
  INVALID_AI_REQUEST: 'error.invalidAiRequest',
  RATE_LIMITED: 'error.rateLimited',
  AI_TIMEOUT: 'error.aiTimeout',
  AI_UNAVAILABLE: 'error.llmService',
  STREAM_INTERRUPTED: 'error.streamInterrupted',
  INVALID_RESPONSE: 'error.invalidResponse',
  HTTP_ERROR: 'error.generate',
};

export function getGenerationErrorMessage(error: unknown, t: (key: string) => string): string {
  if (error instanceof GenerationError) {
    const message = error.code === 'HTTP_ERROR'
      ? error.message
      : t(errorKeys[error.code] || 'error.llmService');
    return error.status ? `${message} (HTTP ${error.status})` : message;
  }
  return t('error.generate');
}
