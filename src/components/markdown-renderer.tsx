'use client';

import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLanguage } from '@/hooks/useLanguage';

export function MarkdownRenderer({ content }: { content: string }) {
  const { t } = useLanguage();
  if (!content) return <div className="text-slate-500 text-center py-8">{t('markdown.waiting')}</div>;
  return (
    <div className="markdown-content text-slate-300 leading-relaxed break-words">
      <Markdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          h1: ({ children }) => <h1 className="text-2xl font-bold text-orange-400 mt-6 mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold text-white mt-8 mb-3 pb-2 border-b border-slate-700">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-semibold text-white mt-6 mb-2">{children}</h3>,
          h4: ({ children }) => <h4 className="font-semibold text-white mt-4 mb-2">{children}</h4>,
          p: ({ children }) => <p className="my-3">{children}</p>,
          strong: ({ children }) => <strong className="text-white">{children}</strong>,
          ul: ({ children }) => <ul className="list-disc pl-6 space-y-1 my-3">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 space-y-1 my-3">{children}</ol>,
          blockquote: ({ children }) => <blockquote className="border-l-2 border-orange-500 pl-4 text-slate-400 my-3">{children}</blockquote>,
          table: ({ children }) => <div className="overflow-x-auto my-4 rounded border border-slate-700"><table className="w-full border-collapse text-sm">{children}</table></div>,
          th: ({ children }) => <th className="border border-slate-700 bg-slate-800 p-3 text-left text-white whitespace-nowrap">{children}</th>,
          td: ({ children }) => <td className="border border-slate-700 p-3 align-top min-w-28">{children}</td>,
          pre: ({ children }) => <pre className="overflow-x-auto rounded bg-slate-800 p-4 my-3 text-sm">{children}</pre>,
          code: ({ children }) => <code className="font-mono text-cyan-200">{children}</code>,
          a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer" className="text-cyan-400 underline underline-offset-2">{children}</a>,
          hr: () => <hr className="border-slate-700 my-6" />,
        }}
      >{content}</Markdown>
    </div>
  );
}
