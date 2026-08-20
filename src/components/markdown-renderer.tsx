'use client';

import { useMemo } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const { t } = useLanguage();
  const html = useMemo(() => {
    if (!content) return '';
    
    let processed = content;
    
    // 处理标题
    processed = processed.replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-white mt-6 mb-2">$1</h3>');
    processed = processed.replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-white mt-8 mb-3 pb-2 border-b border-slate-700">$1</h2>');
    processed = processed.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-orange-400 mt-8 mb-4">$1</h1>');
    
    // 处理粗体和斜体
    processed = processed.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em class="text-orange-300">$1</em></strong>');
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>');
    processed = processed.replace(/\*(.*?)\*/g, '<em class="text-slate-300">$1</em>');
    
    // 处理列表
    processed = processed.replace(/^\- (.*$)/gm, '<li class="text-slate-300 ml-4">• $1</li>');
    processed = processed.replace(/^\* (.*$)/gm, '<li class="text-slate-300 ml-4">• $1</li>');
    processed = processed.replace(/^\d+\. (.*$)/gm, '<li class="text-slate-300 ml-4">$1</li>');
    
    // 处理段落
    processed = processed.split('\n\n').map(para => {
      if (para.startsWith('<h') || para.startsWith('<li')) {
        return para;
      }
      if (para.trim() === '') return '';
      return `<p class="text-slate-300 my-3 leading-relaxed">${para}</p>`;
    }).join('\n');
    
    // 处理换行
    processed = processed.replace(/\n/g, '<br/>');
    
    return processed;
  }, [content]);

  if (!content) {
    return (
      <div className="text-slate-500 text-center py-8">
        {t('markdown.waiting')}
      </div>
    );
  }

  return (
    <div 
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
