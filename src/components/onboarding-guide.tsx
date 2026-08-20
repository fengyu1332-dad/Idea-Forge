'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Search, Lightbulb, FileText, Sparkles, Rocket } from 'lucide-react';

const STEPS = [
  {
    icon: Search,
    title: '需求感知',
    desc: '描述你的痛点或需求，AI 运用创新方法论（TRIZ、JTBD、第一性原理等）深入分析，给出最佳创新方向。',
  },
  {
    icon: Lightbulb,
    title: '灵感输入',
    desc: '选择创新方向后，用大白话描述你的产品想法。可以是模糊的、不完整的，AI 会帮你完善。',
  },
  {
    icon: FileText,
    title: '初步构想',
    desc: 'AI 根据你的想法生成初步产品方案，你可以直接编辑和修改内容，确认后进入专家考验。',
  },
  {
    icon: Sparkles,
    title: '专家考验',
    desc: '五位领域专家（产品、市场、技术、设计、营销）同时审视方案，给出诚实、可操作的意见。你勾选认可的意见进入最终合成。',
  },
  {
    icon: Rocket,
    title: '终极熔铸',
    desc: '综合你的想法和专家意见，AI 生成完整的《产品综合商业计划与需求文档》，包含市场分析、功能规划、技术架构、GTM策略等。',
  },
];

export function OnboardingGuide() {
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
          <h3 className="text-white font-semibold text-base">欢迎使用灵感锻造炉 IdeaForge</h3>
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
          5步将你的毛坯想法锻造为成熟产品方案。每个阶段都可以随时返回修改。
        </p>
        <div className="grid grid-cols-5 gap-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <div className="w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <step.icon className="w-3.5 h-3.5 text-orange-400" />
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-4 h-px bg-slate-700" />
                )}
              </div>
              <p className="text-white text-xs font-medium mb-0.5">{i + 1}. {step.title}</p>
              <p className="text-slate-500 text-[10px] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center">
          <Button
            onClick={dismiss}
            size="sm"
            className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-7"
          >
            开始使用
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
