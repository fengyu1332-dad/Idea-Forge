'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Star, ArrowLeft, ArrowRight, Target } from 'lucide-react';
import { getExperts } from '@/config/experts';
import { ExpertType, ExpertReport, AdviceItem, ProblemType } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';

interface AdviceSummaryPanelProps {
  problemType: ProblemType;
  expertReports: Partial<Record<ExpertType, ExpertReport>>;
  onUpdateReports: (reports: Partial<Record<ExpertType, ExpertReport>>) => void;
  onProceedToSynthesis: () => void;
  onBackToReview: () => void;
}

export function AdviceSummaryPanel({
  problemType,
  expertReports,
  onUpdateReports,
  onProceedToSynthesis,
  onBackToReview,
}: AdviceSummaryPanelProps) {
  const { t, language } = useLanguage();
  const EXPERTS = getExperts(problemType);
  const [reports, setReports] = useState(expertReports);

  const togglePriority = (expertId: ExpertType, itemId: string) => {
    const updated = { ...reports };
    const report = updated[expertId];
    if (!report) return;
    updated[expertId] = {
      ...report,
      opinions: report.opinions.map(o => {
        if (o.id !== itemId) return o;
        const cycle: Array<'high' | 'medium' | 'low' | undefined> = ['high', 'medium', 'low', undefined];
        const idx = cycle.indexOf(o.priority);
        return { ...o, priority: cycle[(idx + 1) % cycle.length] };
      }),
    };
    setReports(updated);
    onUpdateReports(updated);
  };

  const uncheckItem = (expertId: ExpertType, itemId: string) => {
    const updated = { ...reports };
    const report = updated[expertId];
    if (!report) return;
    updated[expertId] = {
      ...report,
      opinions: report.opinions.map(o =>
        o.id === itemId ? { ...o, checked: false } : o,
      ),
    };
    setReports(updated);
    onUpdateReports(updated);
  };

  const allCheckedItems: AdviceItem[] = [];
  for (const expertId of EXPERTS.map(e => e.id)) {
    const report = reports[expertId];
    if (!report) continue;
    allCheckedItems.push(...report.opinions.filter(o => o.checked));
  }

  const highCount = allCheckedItems.filter(o => o.priority === 'high').length;
  const mediumCount = allCheckedItems.filter(o => !o.priority || o.priority === 'medium').length;
  const lowCount = allCheckedItems.filter(o => o.priority === 'low').length;

  const priorityIcon = (p?: string) => {
    if (p === 'high') return <Star className="w-3 h-3 fill-orange-400 text-orange-400" />;
    if (p === 'low') return <Star className="w-3 h-3 text-slate-600" />;
    return <Star className="w-3 h-3 text-slate-500" />;
  };

  const priorityLabel = (p?: string) => {
    if (p === 'high') return t('adviceSummary.priorityHigh');
    if (p === 'low') return t('adviceSummary.priorityLow');
    return t('adviceSummary.priorityMedium');
  };

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-orange-400" />
          {t('adviceSummary.title')}
        </CardTitle>
        <p className="text-slate-400 text-sm">
          {t('adviceSummary.desc').replace('{count}', String(allCheckedItems.length))}
        </p>
        <p className="text-amber-300/80 text-xs">{t('review.riskRetention')}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {allCheckedItems.length === 0 ? (
          <div className="text-slate-500 text-center py-8">
            {t('adviceSummary.empty')}
          </div>
        ) : (
          <Accordion type="multiple" defaultValue={EXPERTS.filter(e => {
            const report = reports[e.id];
            return report && report.opinions.some(o => o.checked);
          }).map(e => e.id)} className="space-y-2">
            {EXPERTS.map(expert => {
              const report = reports[expert.id];
              const checkedOpinions = report?.opinions.filter(o => o.checked) || [];
              if (checkedOpinions.length === 0) return null;

              return (
                <AccordionItem
                  key={expert.id}
                  value={expert.id}
                  className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 data-[state=open]:border-orange-500/30"
                >
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{expert.icon}</span>
                      <span className="text-white text-sm font-medium">{language === 'zh' ? expert.name : expert.title}</span>
                      <Badge variant="outline" className="text-xs text-slate-400 border-slate-600">
                        {checkedOpinions.length} {t('adviceSummary.itemsCount') || '条'}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3 space-y-1.5">
                    {checkedOpinions.map(item => (
                      <div
                        key={item.id}
                        className={`flex items-start gap-2 py-1.5 rounded ${
                          item.priority === 'high' ? 'border-l-2 border-orange-400 pl-2' : 'pl-0'
                        }`}
                      >
                        {/* Priority toggle */}
                        <button
                          onClick={() => togglePriority(expert.id as ExpertType, item.id)}
                          className="mt-0.5 flex-shrink-0 hover:scale-110 transition-transform"
                          title={t('expertReview.priorityTooltip')}
                        >
                          {priorityIcon(item.priority)}
                        </button>

                        {/* Content */}
                        <span className="flex-1 text-slate-300 text-sm">{item.content}</span>

                        {/* Badges */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            item.priority === 'high'
                              ? 'bg-orange-500/20 text-orange-400'
                              : item.priority === 'low'
                              ? 'bg-slate-700 text-slate-500'
                              : 'bg-slate-700 text-slate-400'
                          }`}>
                            {priorityLabel(item.priority)}
                          </span>
                          {/* Remove button */}
                          <button
                            onClick={() => uncheckItem(expert.id as ExpertType, item.id)}
                            className="text-[10px] text-slate-500 hover:text-red-400 transition-colors px-1.5 py-0.5 rounded hover:bg-red-500/10"
                          >
                            {t('adviceSummary.remove')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-700">
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span>{t('adviceSummary.totalLabel')} {allCheckedItems.length} {t('adviceSummary.itemsCount') || '条'}</span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
              {highCount} {t('adviceSummary.priorityHigh')}
            </span>
            <span>· {mediumCount} {t('adviceSummary.priorityMedium')}</span>
            <span>· {lowCount} {t('adviceSummary.priorityLow')}</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onBackToReview}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              {t('adviceSummary.backToModify')}
            </Button>
            <Button
              onClick={onProceedToSynthesis}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {t('adviceSummary.proceedToGenerate')}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
