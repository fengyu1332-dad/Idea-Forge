'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { PROBLEM_PROFILES, PROBLEM_TYPES } from '@/config/problem-types';
import type { ProblemType } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';

export function ProblemTypeSelector({ value, onChange, disabled }: {
  value: ProblemType;
  onChange: (value: ProblemType) => void;
  disabled?: boolean;
}) {
  const { language } = useLanguage();
  return (
    <fieldset disabled={disabled} className="space-y-3">
      <legend className="text-sm font-medium text-slate-200">
        {language === 'zh' ? '这次要解决哪类问题？' : 'What kind of problem are you solving?'}
      </legend>
      <RadioGroup value={value} onValueChange={v => onChange(v as ProblemType)} disabled={disabled} className="grid gap-3 sm:grid-cols-2">
        {PROBLEM_TYPES.map(type => (
          <Label key={type} htmlFor={`problem-${type}`} className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer ${value === type ? 'border-orange-500 bg-orange-500/10' : 'border-slate-700 bg-slate-950/40'}`}>
            <RadioGroupItem id={`problem-${type}`} value={type} className="mt-0.5 border-slate-400 text-orange-400" />
            <span className="space-y-1.5">
              <span className="block text-white">{PROBLEM_PROFILES[type].label[language]}</span>
              <span className="block text-xs font-normal leading-relaxed text-slate-400">{PROBLEM_PROFILES[type].description[language]}</span>
            </span>
          </Label>
        ))}
      </RadioGroup>
    </fieldset>
  );
}
