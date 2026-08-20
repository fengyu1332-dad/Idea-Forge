'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Trash2, FileText, ExternalLink } from 'lucide-react';

const HISTORY_KEY = 'ideaforge_history';
const MAX_ENTRIES = 5;
const MAX_CONTENT_LENGTH = 8000;

interface HistoryEntry {
  id: string;
  productName: string;
  date: string;
  userInput: string;
  initialIdea: string;
  finalDocument: string;
  timestamp: number;
}

export interface HistoryRestoreData {
  userInput: string;
  initialIdea: string;
  finalDocument: string;
}

interface HistoryDrawerProps {
  onRestore: (data: HistoryRestoreData) => void;
  currentData?: {
    userInput: string;
    initialIdea: string;
    finalDocument: string;
  };
}

export function saveToHistory(data: {
  productName: string;
  userInput: string;
  initialIdea: string;
  finalDocument: string;
}) {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const existing: HistoryEntry[] = raw ? JSON.parse(raw) : [];

    const entry: HistoryEntry = {
      id: `hist-${Date.now()}`,
      productName: data.productName,
      date: new Date().toISOString().split('T')[0],
      userInput: data.userInput.slice(0, MAX_CONTENT_LENGTH),
      initialIdea: data.initialIdea.slice(0, MAX_CONTENT_LENGTH),
      finalDocument: data.finalDocument.slice(0, MAX_CONTENT_LENGTH),
      timestamp: Date.now(),
    };

    existing.unshift(entry);
    // 只保留最近 N 条
    if (existing.length > MAX_ENTRIES) {
      existing.length = MAX_ENTRIES;
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(existing));
  } catch { /* quota exceeded */ }
}

export function HistoryDrawer({ onRestore, currentData }: HistoryDrawerProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      try {
        const raw = localStorage.getItem(HISTORY_KEY);
        setHistory(raw ? JSON.parse(raw) : []);
      } catch { setHistory([]); }
    }
  }, [open]);

  const removeEntry = (id: string) => {
    const updated = history.filter(e => e.id !== id);
    setHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  const clearAll = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  const handleRestore = (entry: HistoryEntry) => {
    onRestore({
      userInput: entry.userInput,
      initialIdea: entry.initialIdea,
      finalDocument: entry.finalDocument,
    });
    setOpen(false);
  };

  const previewText = (text: string, maxLen = 120) => {
    if (!text) return '';
    return text.length > maxLen ? text.slice(0, maxLen) + '...' : text;
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-sm"
        >
          <Clock className="w-4 h-4" />
          历史记录
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[420px] sm:max-w-[420px] bg-slate-900 border-slate-700 text-white p-0">
        <SheetHeader className="p-5 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-white flex items-center gap-2 text-base">
              <Clock className="w-4 h-4 text-orange-400" />
              历史记录
            </SheetTitle>
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-xs text-slate-500 hover:text-red-400 h-7"
              >
                清空全部
              </Button>
            )}
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-80px)]">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <FileText className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">暂无历史记录</p>
              <p className="text-xs mt-1">完成一次完整的方案生成后，记录会自动保存在这里</p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {history.map(entry => (
                <div
                  key={entry.id}
                  className="rounded-lg border border-slate-700 bg-slate-800/50 p-3 hover:border-slate-600 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div>
                      <h4 className="text-white text-sm font-medium">{entry.productName}</h4>
                      <p className="text-slate-500 text-xs">{entry.date}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestore(entry)}
                        className="h-7 px-2 text-xs text-orange-400 hover:text-orange-300"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        加载
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEntry(entry.id)}
                        className="h-7 w-7 p-0 text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-slate-600 text-xs line-clamp-2">
                    {previewText(entry.finalDocument || entry.initialIdea || entry.userInput)}
                  </p>
                </div>
              ))}
              <p className="text-[10px] text-slate-600 text-center pt-2">
                最多保留 {MAX_ENTRIES} 条记录
              </p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
