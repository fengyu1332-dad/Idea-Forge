'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Search, Lightbulb, FileText, Sparkles, Rocket } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const STEPS = [
  { icon: Search, titleKey: 'onboarding.step1.title', descKey: 'onboarding.step1.desc' },
  { icon: Lightbulb, titleKey: 'onboarding.step2.title', descKey: 'onboarding.step2.desc' },
  { icon: FileText, titleKey: 'onboarding.step3.title', descKey: 'onboarding.step3.desc' },
  { icon: Sparkles, titleKey: 'onboarding.step4.title', descKey: 'onboarding.step4.desc' },
  { icon: Rocket, titleKey: 'onboarding.step5.title', descKey: 'onboarding.step5.desc' },
];

export function OnboardingGuide() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('ideaforge_onboarding_seen');
    if (!seen) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem('ideaforge_onboarding_seen', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Card className="bg-gradient-to-r from-slate-900 to-slate-800 border-orange-500/20 mb-6">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-white font-semibold text-base">{t('onboarding.welcome')}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={dismiss}
            className="h-7 w-7 p-0 text-slate-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-slate-400 text-xs mb-4">
          {t('onboarding.subtitle')}
        </p>
        <div className="grid grid-cols-5 gap-3">
          {STEPS.map((step, i) => (
            <div key={step.titleKey} className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <div className="w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <step.icon className="w-3.5 h-3.5 text-orange-400" />
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-4 h-px bg-slate-700" />
                )}
              </div>
              <p className="text-white text-xs font-medium mb-0.5">{i + 1}. {t(step.titleKey)}</p>
              <p className="text-slate-500 text-[10px] leading-relaxed">{t(step.descKey)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center">
          <Button
            onClick={dismiss}
            size="sm"
            className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-7"
          >
            {t('onboarding.start')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
