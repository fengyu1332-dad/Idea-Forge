'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, ChevronDown, ChevronUp, Pencil, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { InnovationMethod, getMethodDefaultPrompt } from '@/config/need-sensing';

interface NeedSensingProps {
  onSkip: () => void;
  onSelectDirection: (data: {
    userNeed: string;
    analysisResult: string;
    selectedDirection: string;
    selectedDirectionTitle: string;
    selectedMethodIds: string[];
    customMethodPrompts: Record<string, string>;
    selectedMethodModes: Record<string, string>;
  }) => void;
  methods: InnovationMethod[];
}

export function NeedSensing({ onSkip, onSelectDirection, methods }: NeedSensingProps) {
  const { t, language } = useLanguage();
  const { isAdmin } = useAuth();
  const [userNeed, setUserNeed] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMethodIds, setSelectedMethodIds] = useState<string[]>(['triz']);
  const [customMethodPrompts, setCustomMethodPrompts] = useState<Record<string, string>>({});
  const [selectedMethodModes, setSelectedMethodModes] = useState<Record<string, string>>({});
  const [editingMethodId, setEditingMethodId] = useState<string | null>(null);
  const [directions, setDirections] = useState<Array<{ title: string; description: string }>>([]);

  const toggleMethod = (methodId: string) => {
    setSelectedMethodIds(prev => {
      if (prev.includes(methodId)) {
        if (prev.length <= 1) return prev;
        return prev.filter(id => id !== methodId);
      }
      return [...prev, methodId];
    });
  };

  const updateCustomPrompt = (methodId: string, prompt: string) => {
    setCustomMethodPrompts(prev => ({ ...prev, [methodId]: prompt }));
  };

  const resetCustomPrompt = (methodId: string) => {
    setCustomMethodPrompts(prev => {
      const next = { ...prev };
      delete next[methodId];
      return next;
    });
  };

  const handleAnalyze = async () => {
    if (!userNeed.trim() || selectedMethodIds.length === 0) return;
    setIsLoading(true);
    setAnalysisResult('');
    setDirections([]);

    try {
      const response = await fetch('/api/generate-need-sensing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userNeed,
          selectedMethodIds,
          customMethodPrompts,
          selectedMethodModes,
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
                const detail = typeof data.message === 'string' ? data.message : '';
                const err = new Error(detail || t('error.llmService'));
                err.name = 'LlmServiceError';
                throw err;
              }
              if (data.content) {
                accumulated += data.content;
                setAnalysisResult(accumulated);
              }
            } catch (e) {
              if (e instanceof Error && e.name === 'LlmServiceError') {
                throw e;
              }
            }
          }
        }
      }

      // Parse directions from accumulated result
      if (accumulated) {
        const parsedDirections: Array<{ title: string; description: string }> = [];
        let jsonParsed = false;

        // 优先尝试从 JSON 块解析方向（更可靠）
        const jsonMatch = accumulated.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[1]);
            if (parsed.directions?.length > 0) {
              for (const d of parsed.directions) {
                if (d.title && d.description) {
                  parsedDirections.push({ title: d.title, description: d.description });
                }
              }
              jsonParsed = true;
            }
          } catch { /* JSON parse failed, fallback to regex */ }
        }

        // Fallback: 正则匹配 Markdown 标题中的方向
        if (!jsonParsed) {
          const directionRegex = /(?:###|##)\s*(?:方向\s*(?:\d+)?|Direction\s*(?:\d+)?)\s*[:：]?\s*(.+)/gi;
          const matches: Array<{ index: number; title: string }> = [];
          let match;
          while ((match = directionRegex.exec(accumulated)) !== null) {
            matches.push({ index: match.index, title: match[1].trim() });
          }

          for (let i = 0; i < matches.length; i++) {
            const startIdx = accumulated.indexOf('\n', matches[i].index) + 1;
            const endIdx = i < matches.length - 1 ? matches[i + 1].index : accumulated.length;
            const description = accumulated.slice(startIdx, endIdx).trim();
            parsedDirections.push({ title: matches[i].title, description });
          }
        }

        if (parsedDirections.length > 0) {
          setDirections(parsedDirections);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setAnalysisResult(t('error.generate'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDirection = (direction: { title: string; description: string }, index: number) => {
    onSelectDirection({
      userNeed,
      analysisResult,
      selectedDirection: direction.description,
      selectedDirectionTitle: direction.title,
      selectedMethodIds,
      customMethodPrompts,
      selectedMethodModes,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-400" />
            {t('sensing.title')}
          </CardTitle>
          <p className="text-slate-400 text-sm">{t('sensing.subtitle')}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 需求输入 */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              {t('sensing.inputLabel')}
            </label>
            <Textarea
              value={userNeed}
              onChange={(e) => setUserNeed(e.target.value)}
              placeholder={t('sensing.placeholder')}
              className="min-h-[80px] bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>

          {/* 方法论选择 */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-3 block">
              {t('sensing.methodSelect')}
              <span className="text-slate-500 ml-2">
                ({t('sensing.selected')} {selectedMethodIds.length})
              </span>
            </label>
            <div className="space-y-2">
              {methods.map(method => {
                const isSelected = selectedMethodIds.includes(method.id);
                const isCustom = !!customMethodPrompts[method.id];
                const isEditing = editingMethodId === method.id;

                return (
                  <div
                    key={method.id}
                    className={`rounded-lg border p-3 transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-orange-500/50'
                        : 'bg-slate-800/50 border-slate-700 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleMethod(method.id)}
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-orange-500 border-orange-500'
                              : 'border-slate-600'
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-white text-sm font-medium">{method.name}</span>
                            {isCustom && (
                              <Badge variant="outline" className="text-xs text-orange-400 border-orange-400/50">
                                {t('sensing.methodCustom')}
                              </Badge>
                            )}
                          </div>
                          <span className="text-slate-500 text-xs mt-0.5">{method.description}</span>
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingMethodId(isEditing ? null : method.id)}
                            className="h-7 px-2 text-xs text-slate-400 hover:text-white"
                          >
                            <Pencil className="w-3 h-3 mr-1" />
                            {t('sensing.editPrompt')}
                            {isEditing ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* 模式选择器（当方法论有多模式时显示） */}
                    {method.modes && method.modes.length > 0 && isSelected && (
                      <div className="flex items-center gap-3 mt-2 ml-6">
                        <span className="text-xs text-slate-500">
                          {t('sensing.mode')}:
                        </span>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name={`mode-${method.id}`}
                            checked={!selectedMethodModes[method.id]}
                            onChange={() => {
                              setSelectedMethodModes(prev => {
                                const next = { ...prev };
                                delete next[method.id];
                                return next;
                              });
                            }}
                            className="w-3 h-3 text-orange-500 accent-orange-500"
                          />
                          <span className="text-xs text-slate-300">{method.name} {t('sensing.basicMode')}</span>
                        </label>
                        {method.modes.map(mode => (
                          <label key={mode.id} className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name={`mode-${method.id}`}
                              checked={selectedMethodModes[method.id] === mode.id}
                              onChange={() => {
                                setSelectedMethodModes(prev => ({ ...prev, [method.id]: mode.id }));
                              }}
                              className="w-3 h-3 text-orange-500 accent-orange-500"
                            />
                            <span className="text-xs text-orange-400">{mode.name}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {isEditing && isAdmin && (
                      <div className="mt-3 space-y-2">
                        <Textarea
                          value={
                            customMethodPrompts[method.id] ??
                            (selectedMethodModes[method.id] && method.modes
                              ? method.modes.find(m => m.id === selectedMethodModes[method.id])?.prompt || method.prompt
                              : method.prompt)
                          }
                          onChange={(e) => updateCustomPrompt(method.id, e.target.value)}
                          className="min-h-[120px] bg-slate-900 border-slate-600 text-slate-300 text-xs font-mono"
                        />
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resetCustomPrompt(method.id)}
                            className="h-7 px-2 text-xs text-slate-400 hover:text-white"
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            {t('sensing.resetPrompt')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <Button
              onClick={handleAnalyze}
              disabled={!userNeed.trim() || isLoading || selectedMethodIds.length === 0}
              className="bg-orange-500 hover:bg-orange-600 text-white flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('sensing.analyzing')}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t('sensing.analyze')}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onSkip}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              {t('sensing.skip')}
            </Button>
          </div>

          {/* 分析结果 */}
          {analysisResult && (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                <h3 className="text-sm font-medium text-slate-300 mb-2">{t('sensing.directions')}</h3>
                <div className="text-sm text-slate-300 whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                  {analysisResult}
                </div>
              </div>

              {directions.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-300">{t('sensing.directions')}</h3>
                  {directions.map((direction, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-slate-700 bg-slate-800/50 p-3 hover:border-orange-500/50 transition-colors cursor-pointer"
                      onClick={() => handleSelectDirection(direction, index)}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-white text-sm font-medium">{direction.title}</h4>
                        <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white h-7">
                          {t('sensing.selectDirection')}
                        </Button>
                      </div>
                      <p className="text-slate-400 text-xs mt-1 line-clamp-2">{direction.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
