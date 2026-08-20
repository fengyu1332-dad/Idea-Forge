'use client';

import { useCallback } from 'react';

const STORAGE_KEY = 'ideaforge_state';

interface PersistedState {
  stage: string;
  userInput: string;
  initialIdea: string;
  expertReports: unknown;
  finalDocument: string;
  showAdviceSummary: boolean;
  selectedDirection: string | null;
  needSensingData: unknown;
  timestamp: number;
}

export function usePersistState() {
  const saveState = useCallback((state: Partial<PersistedState>) => {
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      // 不保存过大的字段：finalDocument和initialIdea截断至10000字符
      const sanitized = { ...state };
      if (typeof sanitized.initialIdea === 'string' && sanitized.initialIdea.length > 10000) {
        sanitized.initialIdea = sanitized.initialIdea.slice(0, 10000);
      }
      if (typeof sanitized.finalDocument === 'string' && sanitized.finalDocument.length > 10000) {
        sanitized.finalDocument = sanitized.finalDocument.slice(0, 10000);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...existing,
        ...sanitized,
        timestamp: Date.now(),
      }));
    } catch { /* quota exceeded, ignore */ }
  }, []);

  const loadState = useCallback((): Partial<PersistedState> | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw) as PersistedState;
      // 超过24小时自动失效
      if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return data;
    } catch { return null; }
  }, []);

  const clearState = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { saveState, loadState, clearState };
}
