'use client';

import { METHOD_REFERENCES } from '@/config/evidence';
import { useLanguage } from '@/hooks/useLanguage';

export function EvidenceNotice() {
  const { language } = useLanguage();
  return (
    <details className="rounded-lg border border-slate-700 p-3 text-xs leading-relaxed text-slate-400">
      <summary className="cursor-pointer text-slate-300">
        {language === 'zh' ? '分析依据与能力范围' : 'Analysis basis and capabilities'}
      </summary>
      <p className="mt-2">{language === 'zh'
        ? 'AI 输出用于提出和检验假设。当前未联网检索市场或专利，未接入矛盾矩阵查询及仿真；TRIZ 建议属于方法启发。基线、阈值和结论需由资料或试验确认。'
        : 'AI output helps form and test hypotheses. Live market / patent search, contradiction-matrix lookup and simulation are not connected. TRIZ suggestions are heuristic; baselines, thresholds and conclusions require evidence or testing.'}</p>
      <p className="mt-2">{language === 'zh' ? '以下资料支持方法定义，不构成本项目的验证证据：' : 'These sources support method definitions, not validation of this project:'}</p>
      <ul className="mt-1 space-y-1">
        {METHOD_REFERENCES.map(ref => <li key={ref.id}><a href={ref.url} target="_blank" rel="noreferrer" className="text-cyan-400 underline underline-offset-2">{ref.title}</a></li>)}
      </ul>
    </details>
  );
}
