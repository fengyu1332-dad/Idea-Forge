'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, Rocket, Sparkles, AlertTriangle, Download, FileText } from 'lucide-react';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { useLanguage } from '@/hooks/useLanguage';
import { useState } from 'react';

interface SynthesisPanelProps {
  finalDocument: string;
  isGenerating: boolean;
  progressText?: string;
  onGenerate: () => void;
  onReset: () => void;
  onExportMarkdown: () => void;
  onExportComplete: () => void;
}

export function SynthesisPanel({
  finalDocument,
  isGenerating,
  progressText,
  onGenerate,
  onReset,
  onExportMarkdown,
  onExportComplete,
}: SynthesisPanelProps) {
  const { t } = useLanguage();
  const [showResetDialog, setShowResetDialog] = useState(false);

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Rocket className="w-5 h-5 text-green-400" />
          {t('synthesis.title')}
        </CardTitle>
        <CardDescription className="text-slate-400">
          {t('synthesis.desc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!finalDocument && !isGenerating && (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="w-16 h-16 text-orange-400 mb-4" />
            <p className="text-slate-400 mb-6 text-center">
              {t('synthesis.ready')}
            </p>
            <Button
              onClick={onGenerate}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {t('synthesis.generate')}
            </Button>
          </div>
        )}

        {(finalDocument || isGenerating) && (
          <>
            <ScrollArea className="h-[600px] w-full rounded-lg border border-slate-700 bg-slate-950 p-6">
              <MarkdownRenderer content={finalDocument.replace(/\[SECTION_COMPLETE\]/g, '')} />
              {isGenerating && (
                <div className="flex items-center gap-2 text-slate-400 mt-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {progressText || t('synthesis.generating')}
                </div>
              )}
            </ScrollArea>

            {!isGenerating && finalDocument && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between">
                  <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                    <Button variant="outline" onClick={() => setShowResetDialog(true)} className="border-slate-600 text-slate-300">
                      {t('synthesis.restart')}
                    </Button>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('synthesis.restartConfirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('synthesis.restartConfirmDesc')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowResetDialog(false)}>
                          {t('synthesis.restartCancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            setShowResetDialog(false);
                            onReset();
                          }}
                        >
                          {t('synthesis.restartConfirm')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <div className="flex gap-2">
                    <Button
                      onClick={onExportMarkdown}
                      variant="outline"
                      className="border-slate-600 text-slate-300"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t('synthesis.exportFinal')}
                    </Button>
                    <Button
                      onClick={onGenerate}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      {t('synthesis.regenerate')}
                    </Button>
                  </div>
                </div>
                <div className="border-t border-slate-700 pt-4">
                  <Button
                    onClick={onExportComplete}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {t('synthesis.downloadAll')}
                  </Button>
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    {t('synthesis.downloadAllDesc')}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
