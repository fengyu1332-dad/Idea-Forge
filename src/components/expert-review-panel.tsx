'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Loader2,
  CheckCircle2,
  Sparkles,
  Star,
  Plus,
  Trash2,
  ArrowLeft,
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { EXPERTS } from '@/config/experts';
import { ExpertType, ExpertReport, AdviceItem } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ExpertReviewPanelProps {
  userInput: string;
  initialIdea: string;
  onConfirm: (reports: Partial<Record<ExpertType, ExpertReport>>) => void;
  onBack?: () => void;
}

interface ExpertState {
  status: 'pending' | 'loading' | 'done';
  opinions: AdviceItem[];
}

function generateId(): string {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** 解析专家AI输出为意见列表 */
function parseOpinions(rawContent: string, expertType: ExpertType): AdviceItem[] {
  if (!rawContent?.trim()) return [];

  const lines = rawContent.split('\n');
  const items: AdviceItem[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // 匹配 "- " 或 "• " 或 "* " 开头的内容
    const bulletMatch = trimmed.match(/^[-*•]\s+(.+)/);
    // 匹配编号列表 "1. " "1) " "1）" "1、"
    const numberedMatch = trimmed.match(/^\d+[).）、]\s*(.+)/);

    const content = bulletMatch?.[1] || numberedMatch?.[1];
    if (content && content.length >= 5) {
      items.push({
        id: generateId(),
        content,
        checked: true,
        expertType,
      });
    }
  }

  return items;
}

export function ExpertReviewPanel({ userInput, initialIdea, onConfirm, onBack }: ExpertReviewPanelProps) {
  const { t, language } = useLanguage();
  const [experts, setExperts] = useState<Record<string, ExpertState>>({});

  // 初始化专家状态
  useEffect(() => {
    setExperts(
      Object.fromEntries(
        EXPERTS.map(e => [e.id, { status: 'loading' as const, opinions: [] }]),
      ),
    );

    const controller = new AbortController();

    (async () => {
      try {
        const response = await fetch('/api/generate-expert-reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userInput, initialIdea }),
          signal: controller.signal,
        });

        if (!response.ok) throw new Error('API error');

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No reader');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.done) break;
                if (data.error) throw new Error(data.error);
                if (data.expertId && data.content) {
                  const opinions = parseOpinions(data.content, data.expertId as ExpertType);
                  setExperts(prev => ({
                    ...prev,
                    [data.expertId]: { status: 'done', opinions },
                  }));
                }
              } catch {
                // 忽略解析错误
              }
            }
          }
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          // 标记所有仍在 loading 的专家为 done（显示为错误状态）
          setExperts(prev => {
            const next = { ...prev };
            for (const key of Object.keys(next)) {
              if (next[key].status === 'loading') {
                next[key] = { status: 'done', opinions: [] };
              }
            }
            return next;
          });
        }
      }
    })();

    return () => controller.abort();
  }, [userInput, initialIdea]);

  const allDone = Object.values(experts).every(e => e.status === 'done');

  const toggleOpinion = useCallback((expertId: string, itemId: string) => {
    setExperts(prev => {
      const expert = prev[expertId];
      if (!expert) return prev;
      return {
        ...prev,
        [expertId]: {
          ...expert,
          opinions: expert.opinions.map(o =>
            o.id === itemId ? { ...o, checked: !o.checked } : o,
          ),
        },
      };
    });
  }, []);

  const togglePriority = useCallback((expertId: string, itemId: string) => {
    setExperts(prev => {
      const expert = prev[expertId];
      if (!expert) return prev;
      return {
        ...prev,
        [expertId]: {
          ...expert,
          opinions: expert.opinions.map(o => {
            if (o.id !== itemId) return o;
            const cycle: Array<'high' | 'medium' | 'low' | undefined> = ['high', 'medium', 'low', undefined];
            const idx = cycle.indexOf(o.priority);
            return { ...o, priority: cycle[(idx + 1) % cycle.length] };
          }),
        },
      };
    });
  }, []);

  const updateOpinion = useCallback((expertId: string, itemId: string, content: string) => {
    setExperts(prev => {
      const expert = prev[expertId];
      if (!expert) return prev;
      return {
        ...prev,
        [expertId]: {
          ...expert,
          opinions: expert.opinions.map(o =>
            o.id === itemId ? { ...o, content } : o,
          ),
        },
      };
    });
  }, []);

  const addCustomOpinion = useCallback((expertId: string) => {
    const newItem: AdviceItem = {
      id: generateId(),
      content: '',
      checked: true,
      expertType: expertId as ExpertType,
    };
    setExperts(prev => {
      const expert = prev[expertId];
      if (!expert) return prev;
      return {
        ...prev,
        [expertId]: {
          ...expert,
          opinions: [...expert.opinions, newItem],
        },
      };
    });
  }, []);

  const removeOpinion = useCallback((expertId: string, itemId: string) => {
    setExperts(prev => {
      const expert = prev[expertId];
      if (!expert) return prev;
      return {
        ...prev,
        [expertId]: {
          ...expert,
          opinions: expert.opinions.filter(o => o.id !== itemId),
        },
      };
    });
  }, []);

  const handleConfirm = () => {
    const reports: Partial<Record<ExpertType, ExpertReport>> = {};
    for (const [expertId, state] of Object.entries(experts)) {
      reports[expertId as ExpertType] = {
        expertId: expertId as ExpertType,
        opinions: state.opinions,
        rawContent: state.opinions.map(o => `- ${o.content}`).join('\n'),
      };
    }
    onConfirm(reports);
  };

  const totalChecked = Object.values(experts).reduce(
    (sum, e) => sum + e.opinions.filter(o => o.checked).length,
    0,
  );

  const priorityIcon = (p?: string) => {
    if (p === 'high') return <Star className="w-3 h-3 fill-orange-400 text-orange-400" />;
    if (p === 'low') return <Star className="w-3 h-3 text-slate-600" />;
    return <Star className="w-3 h-3 text-slate-500" />;
  };

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-400" />
          {t('stage.expertReview')}
        </CardTitle>
        <p className="text-slate-400 text-sm">
          {t('expertReview.panelDesc')}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Accordion type="multiple" defaultValue={EXPERTS.map(e => e.id)} className="space-y-3">
          {EXPERTS.map(expert => {
            const state = experts[expert.id];
            const status = state?.status || 'pending';

            return (
              <AccordionItem
                key={expert.id}
                value={expert.id}
                className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 data-[state=open]:border-slate-600"
              >
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{expert.icon}</span>
                    <span className="text-white text-sm font-medium">{expert.name}</span>
                    {status === 'loading' && (
                      <span className="flex items-center gap-1 text-xs text-orange-400">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {t('expertReview.generating')}
                      </span>
                    )}
                    {status === 'done' && (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <CheckCircle2 className="w-3 h-3" />
                        {t('expertReview.done')} ({state.opinions.length}{t('expertReview.opinionsCount')})
                      </span>
                    )}
                    {status === 'pending' && (
                      <span className="text-xs text-slate-500">{t('expertReview.pending')}</span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 space-y-1.5">
                  {status === 'loading' && (
                    <div className="flex items-center gap-2 text-slate-500 text-sm py-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('expertReview.analyzing')}
                    </div>
                  )}
                  {status === 'done' && state.opinions.length === 0 && (
                    <div className="text-slate-500 text-sm py-2">
                      {t('expertReview.noOpinions')}
                    </div>
                  )}
                  {state?.opinions.map(item => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-2 py-1.5 pr-2 rounded transition-colors ${
                        item.checked
                          ? 'opacity-100'
                          : 'opacity-50'
                      } ${item.priority === 'high' ? 'border-l-2 border-orange-400 pl-2' : 'pl-0'}`}
                    >
                      <TooltipProvider delayDuration={500}>
                        {/* Priority toggle */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => togglePriority(expert.id, item.id)}
                              className="mt-0.5 flex-shrink-0 hover:scale-110 transition-transform"
                            >
                              {priorityIcon(item.priority)}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-xs">{t('expertReview.priorityTooltip')}</p>
                          </TooltipContent>
                        </Tooltip>

                        {/* Checkbox */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => toggleOpinion(expert.id, item.id)}
                              className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                                item.checked
                                  ? 'bg-orange-500 border-orange-500'
                                  : 'border-slate-600'
                              }`}
                            >
                              {item.checked && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-xs">{item.checked ? (language === 'zh' ? '取消采纳' : 'Uncheck') : (language === 'zh' ? '采纳此意见' : 'Accept this opinion')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* Content */}
                      <Textarea
                        value={item.content}
                        onChange={e => updateOpinion(expert.id, item.id, e.target.value)}
                        className="flex-1 bg-transparent border-none text-slate-300 text-sm p-0 min-h-[24px] h-auto resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        rows={1}
                      />

                      {/* Delete */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => removeOpinion(expert.id, item.id)}
                            className="flex-shrink-0 text-slate-600 hover:text-red-400 transition-colors mt-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="text-xs">{language === 'zh' ? '删除此意见' : 'Remove this opinion'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  ))}

                  {/* Add custom opinion */}
                  <button
                    onClick={() => addCustomOpinion(expert.id)}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-orange-400 transition-colors mt-2"
                  >
                    <Plus className="w-3 h-3" />
                    {t('expertReview.addCustom')}
                  </button>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {/* Bottom bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-400 hover:text-white -ml-2">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                {t('idea.back')}
              </Button>
            )}
            <span className="text-sm text-slate-400">
              {t('expertReview.accepted')} <span className="text-orange-400 font-medium">{totalChecked}</span> {t('expertReview.opinionsCount')}
            </span>
          </div>
          <Button
            onClick={handleConfirm}
            disabled={!allDone}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {allDone ? t('expertReview.confirmToSummary') : t('expertReview.waitingAll')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
