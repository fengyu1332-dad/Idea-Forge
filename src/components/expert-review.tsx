'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { EXPERTS } from '@/config/experts';
import type { Expert, ExpertReport } from '@/types';

interface AdviceItem {
  id: string;
  content: string;
  checked: boolean;
  isCustom?: boolean;
}

interface ParsedReport {
  fatalFlaws: AdviceItem[];
  opportunities: AdviceItem[];
  suggestions: AdviceItem[];
}

interface ExpertReviewProps {
  expertType: string;
  initialIdea: string;
  userInput: string;
  previousReports: Record<string, ExpertReport>;
  onConfirm: (parsedReport: ParsedReport, rawReport: string) => void;
}

function parseContentToItems(content: string): AdviceItem[] {
  if (!content || !content.trim()) return [];
  const items: AdviceItem[] = [];
  const lines = content.split('\n');
  let currentItem: string | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentItem) {
        items.push({
          id: `item-${items.length}`,
          content: currentItem.replace(/\*\*/g, '').trim(),
          checked: true,
        });
        currentItem = null;
      }
      continue;
    }

    const listMatch = trimmed.match(/^[-*•]\s+(.+)/) ||
                      trimmed.match(/^\d+[.)）、]\s*(.+)/) ||
                      trimmed.match(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*(.+)/);

    if (listMatch) {
      if (currentItem) {
        items.push({
          id: `item-${items.length}`,
          content: currentItem.replace(/\*\*/g, '').trim(),
          checked: true,
        });
      }
      currentItem = listMatch[1];
    } else if (currentItem) {
      currentItem += ' ' + trimmed;
    } else {
      if (trimmed.length >= 5) {
        if (currentItem) {
          items.push({
            id: `item-${items.length}`,
            content: currentItem.replace(/\*\*/g, '').trim(),
            checked: true,
          });
        }
        currentItem = trimmed;
      }
    }
  }

  if (currentItem && currentItem.trim().length >= 5) {
    items.push({
      id: `item-${items.length}`,
      content: currentItem.replace(/\*\*/g, '').trim(),
      checked: true,
    });
  }

  return items;
}

function parseReport(rawReport: string): ParsedReport {
  const sectionRegex = /##\s*致命缺陷\s*(?:\([^)]*\))?\s*\n([\s\S]*?)(?=##\s*(?:核心机遇|重构建议)|$)/i;
  const opportunityRegex = /##\s*核心机遇\s*(?:\([^)]*\))?\s*\n([\s\S]*?)(?=##\s*(?:重构建议|致命缺陷)|$)/i;
  const suggestionRegex = /##\s*重构建议\s*(?:\([^)]*\))?\s*\n([\s\S]*?)(?=##\s*(?:致命缺陷|核心机遇)|$)/i;

  const fatalMatch = rawReport.match(sectionRegex);
  const oppMatch = rawReport.match(opportunityRegex);
  const suggMatch = rawReport.match(suggestionRegex);

  // Fallback: try English headers
  const fatalEnRegex = /##\s*Fatal\s*Flaw[s]?\s*(?:\([^)]*\))?\s*\n([\s\S]*?)(?=##\s*(?:Core\s*Opportunit|Reconstruction|重构建议|核心机遇)|$)/i;
  const oppEnRegex = /##\s*Core\s*Opportunit(?:y|ies)\s*(?:\([^)]*\))?\s*\n([\s\S]*?)(?=##\s*(?:Reconstruction|Fatal|重构建议|致命缺陷)|$)/i;
  const suggEnRegex = /##\s*Reconstruction\s*Advice\s*(?:\([^)]*\))?\s*\n([\s\S]*?)(?=##\s*(?:Fatal|Core\s*Opportunit|致命缺陷|核心机遇)|$)/i;

  const fatalContent = fatalMatch?.[1] || rawReport.match(fatalEnRegex)?.[1] || '';
  const oppContent = oppMatch?.[1] || rawReport.match(oppEnRegex)?.[1] || '';
  const suggContent = suggMatch?.[1] || rawReport.match(suggEnRegex)?.[1] || '';

  return {
    fatalFlaws: parseContentToItems(fatalContent),
    opportunities: parseContentToItems(oppContent),
    suggestions: parseContentToItems(suggContent),
  };
}

export function ExpertReview({ expertType, initialIdea, userInput, previousReports, onConfirm }: ExpertReviewProps) {
  const { t, language } = useLanguage();
  const [rawReport, setRawReport] = useState('');
  const [parsedReport, setParsedReport] = useState<ParsedReport>({
    fatalFlaws: [],
    opportunities: [],
    suggestions: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const parseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const expert = EXPERTS.find(e => e.id === expertType) as Expert | undefined;

  useEffect(() => {
    const generateReport = async () => {
      setIsLoading(true);
      setRawReport('');
      try {
        const response = await fetch('/api/generate-expert-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userInput,
            initialIdea,
            expertType,
            previousReports,
          }),
        });

        if (!response.ok) throw new Error(t('error.generate'));

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No reader');

        const decoder = new TextDecoder();
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.error) {
                  throw new Error(t('error.llmService'));
                }
                if (data.content) {
                  accumulated += data.content;
                  setRawReport(accumulated);
                }
              } catch (e) {
                if (e instanceof Error && e.message === t('error.llmService')) {
                  throw e;
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error:', error);
        setRawReport(t('error.generate'));
      } finally {
        setIsLoading(false);
      }
    };

    generateReport();
  }, [expertType, initialIdea, userInput, previousReports]);

  // Auto-parse raw report with debounce
  useEffect(() => {
    if (parseTimeoutRef.current) {
      clearTimeout(parseTimeoutRef.current);
    }
    parseTimeoutRef.current = setTimeout(() => {
      if (rawReport && !isLoading) {
        const parsed = parseReport(rawReport);
        if (parsed.fatalFlaws.length > 0 || parsed.opportunities.length > 0 || parsed.suggestions.length > 0) {
          setParsedReport(prev => ({
            fatalFlaws: parsed.fatalFlaws.map((item, i) => ({
              ...item,
              checked: prev.fatalFlaws[i]?.checked ?? item.checked,
            })),
            opportunities: parsed.opportunities.map((item, i) => ({
              ...item,
              checked: prev.opportunities[i]?.checked ?? item.checked,
            })),
            suggestions: parsed.suggestions.map((item, i) => ({
              ...item,
              checked: prev.suggestions[i]?.checked ?? item.checked,
            })),
          }));
        }
      }
    }, 300);

    return () => {
      if (parseTimeoutRef.current) {
        clearTimeout(parseTimeoutRef.current);
      }
    };
  }, [rawReport, isLoading]);

  const toggleItem = (section: 'fatalFlaws' | 'opportunities' | 'suggestions', id: string) => {
    setParsedReport(prev => ({
      ...prev,
      [section]: prev[section].map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    }));
  };

  const updateItemContent = (section: 'fatalFlaws' | 'opportunities' | 'suggestions', id: string, content: string) => {
    setParsedReport(prev => ({
      ...prev,
      [section]: prev[section].map(item =>
        item.id === id ? { ...item, content } : item
      ),
    }));
  };

  const addItem = (section: 'fatalFlaws' | 'opportunities' | 'suggestions') => {
    const newItem: AdviceItem = {
      id: `custom-${Date.now()}`,
      content: '',
      checked: true,
      isCustom: true,
    };
    setParsedReport(prev => ({
      ...prev,
      [section]: [...prev[section], newItem],
    }));
  };

  const removeItem = (section: 'fatalFlaws' | 'opportunities' | 'suggestions', id: string) => {
    setParsedReport(prev => ({
      ...prev,
      [section]: prev[section].filter(item => item.id !== id),
    }));
  };

  const handleConfirm = () => {
    onConfirm(parsedReport, rawReport);
  };

  const getExpertName = () => {
    const key = `expert.${expertType}` as const;
    return t(key);
  };

  const getExpertDesc = () => {
    const key = `expertDesc.${expertType}` as const;
    return t(key);
  };

  const sectionConfig = [
    { key: 'fatalFlaws' as const, label: t('review.redFlag'), color: 'text-red-400', borderColor: 'border-red-500/30', bgColor: 'bg-red-500/5' },
    { key: 'opportunities' as const, label: t('review.greenLight'), color: 'text-green-400', borderColor: 'border-green-500/30', bgColor: 'bg-green-500/5' },
    { key: 'suggestions' as const, label: t('review.advice'), color: 'text-blue-400', borderColor: 'border-blue-500/30', bgColor: 'bg-blue-500/5' },
  ];

  const checkedCount = parsedReport.fatalFlaws.filter(i => i.checked).length +
    parsedReport.opportunities.filter(i => i.checked).length +
    parsedReport.suggestions.filter(i => i.checked).length;
  const totalCount = parsedReport.fatalFlaws.length +
    parsedReport.opportunities.length +
    parsedReport.suggestions.length;

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <span className="text-2xl">{expert?.icon || '🔍'}</span>
            {getExpertName()}
          </CardTitle>
          {totalCount > 0 && (
            <Badge variant="outline" className="text-orange-400 border-orange-400/50">
              {checkedCount}/{totalCount} {t('expert.accepted')}
            </Badge>
          )}
        </div>
        <p className="text-slate-400 text-sm">{getExpertDesc()}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            {t('review.generating')}
          </div>
        ) : (
          <>
            {/* Raw Report */}
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
              <h3 className="text-sm font-medium text-slate-300 mb-2">{t('review.rawReport')}</h3>
              <div className="text-sm text-slate-300 whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                {rawReport}
              </div>
            </div>

            {/* Advice Panel */}
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
              <h3 className="text-sm font-medium text-slate-300 mb-3">{t('review.advicePanel')}</h3>
              <div className="space-y-4">
                {sectionConfig.map(({ key, label, color, borderColor, bgColor }) => {
                  const items = parsedReport[key];
                  return (
                    <div key={key} className={`rounded-lg border ${borderColor} ${bgColor} p-3`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`text-sm font-medium ${color}`}>{label}</h4>
                        {items.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const allChecked = items.every(i => i.checked);
                              setParsedReport(prev => ({
                                ...prev,
                                [key]: prev[key].map(item => ({ ...item, checked: !allChecked })),
                              }));
                            }}
                            className="h-6 px-2 text-xs text-slate-400 hover:text-white"
                          >
                            {t('review.selectAll')}
                          </Button>
                        )}
                      </div>
                      {items.length === 0 ? (
                        <p className="text-slate-500 text-xs italic">{t('review.empty')}</p>
                      ) : (
                        <div className="space-y-2">
                          {items.map(item => (
                            <div key={item.id} className="flex items-start gap-2 group">
                              <button
                                onClick={() => toggleItem(key, item.id)}
                                className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                                  item.checked
                                    ? 'bg-orange-500 border-orange-500'
                                    : 'border-slate-600'
                                }`}
                              >
                                {item.checked && <Check className="w-3 h-3 text-white" />}
                              </button>
                              {item.isCustom ? (
                                <div className="flex-1 flex items-start gap-1">
                                  <Textarea
                                    value={item.content}
                                    onChange={(e) => updateItemContent(key, item.id, e.target.value)}
                                    className="min-h-[40px] bg-slate-900 border-slate-600 text-white text-xs"
                                    placeholder={t('review.addCustom')}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeItem(key, item.id)}
                                    className="h-7 w-7 p-0 text-slate-500 hover:text-red-400"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              ) : (
                                <span
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={(e) => updateItemContent(key, item.id, e.currentTarget.textContent || '')}
                                  className={`text-sm flex-1 outline-none cursor-text transition-opacity ${
                                    item.checked ? 'text-white' : 'text-white/40'
                                  }`}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addItem(key)}
                        className="mt-2 h-7 px-2 text-xs text-slate-400 hover:text-orange-400"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {t('review.addCustom')}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button
              onClick={handleConfirm}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              {t('review.confirm')}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
