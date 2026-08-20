'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sparkles,
  ArrowRight,
  Loader2,
  Download,
  FileText,
  Lightbulb,
  Search,
  Globe
} from 'lucide-react';
import { ExpertType, ExpertReport, WorkflowStage, AdviceItem } from '@/types';
import { EXPERTS } from '@/config/experts';
import { INNOVATION_METHODS } from '@/config/need-sensing';
import { NeedSensing } from '@/components/need-sensing';
import { ExpertReviewPanel } from '@/components/expert-review-panel';
import { AdviceSummaryPanel } from '@/components/advice-summary-panel';
import { SynthesisPanel } from '@/components/synthesis-panel';
import { OnboardingGuide } from '@/components/onboarding-guide';
import { ProjectList } from '@/components/project-list';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useProject } from '@/hooks/useProject';
import Link from 'next/link';
import { LogOut, LogIn, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function HomePage() {
  const { language, setLanguage, t } = useLanguage();
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const [stage, setStage] = useState<WorkflowStage>('need-sensing');
  const [userInput, setUserInput] = useState('');
  const [initialIdea, setInitialIdea] = useState('');
  const [expertReports, setExpertReports] = useState<Partial<Record<ExpertType, ExpertReport>>>({});
  const [finalDocument, setFinalDocument] = useState('');
  const [synthesisProgress, setSynthesisProgress] = useState('');
  const [showAdviceSummary, setShowAdviceSummary] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDirection, setSelectedDirection] = useState<string | null>(null);
  const [needSensingData, setNeedSensingData] = useState<{
    userNeed: string;
    analysisResult: string;
    selectedDirection: string;
    selectedDirectionTitle: string;
    selectedMethodIds: string[];
    customMethodPrompts: Record<string, string>;
    selectedMethodModes: Record<string, string>;
  } | null>(null);

  const {
    projectId,
    projectList,
    isLoadingList,
    createNewProject,
    loadProject,
    saveProject,
    deleteProject,
    refreshList,
  } = useProject();

  // 自动保存：关键状态变更时 save 到服务端
  useEffect(() => {
    if (!projectId || stage === 'need-sensing') return;
    saveProject({
      currentStage: stage,
      progress: calculateProgress(),
      userInput,
      initialIdea,
      expertReports,
      finalDocument,
      needSensingData,
      showAdviceSummary,
      selectedDirection,
      isCompleted: stage === 'synthesis' && !!finalDocument,
    });
  }, [stage, userInput, initialIdea, expertReports, finalDocument, needSensingData, showAdviceSummary, selectedDirection]);

  const handleOpenProject = async (id: string) => {
    const data = await loadProject(id);
    if (!data) return;
    setUserInput(data.userInput);
    setInitialIdea(data.initialIdea);
    setFinalDocument(data.finalDocument);
    setExpertReports(data.expertReports);
    setNeedSensingData(data.needSensingData as typeof needSensingData);
    setShowAdviceSummary(data.showAdviceSummary);
    setSelectedDirection(data.selectedDirection);
    setStage(data.currentStage);
    toast.success(t('page.projectLoaded'));
  };

  const handleNewProject = () => {
    if (stage !== 'need-sensing' && (userInput || initialIdea)) {
      if (!window.confirm(t('page.unsavedConfirm'))) return;
    }
    reset();
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id);
  };

  const skipNeedSensing = () => {
    setStage('input');
  };

  const selectDirection = (data: {
    userNeed: string;
    analysisResult: string;
    selectedDirection: string;
    selectedDirectionTitle: string;
    selectedMethodIds: string[];
    customMethodPrompts: Record<string, string>;
    selectedMethodModes: Record<string, string>;
  }) => {
    // 自动创建项目（如果尚未创建；游客不落盘）
    if (!projectId && isAuthenticated) {
      createNewProject(data.selectedDirectionTitle || data.userNeed);
    }
    setNeedSensingData({
      userNeed: data.userNeed,
      analysisResult: data.analysisResult,
      selectedDirection: data.selectedDirection,
      selectedDirectionTitle: data.selectedDirectionTitle,
      selectedMethodIds: data.selectedMethodIds,
      customMethodPrompts: data.customMethodPrompts,
      selectedMethodModes: data.selectedMethodModes,
    });
    setSelectedDirection(data.selectedDirectionTitle);
    const prefix = language === 'zh' ? '基于需求感知分析' : 'Based on need sensing analysis';
    const userNeedLabel = language === 'zh' ? '用户核心需求' : 'Core user need';
    const gapLabel = language === 'zh' ? '需求缺口分析' : 'Gap analysis';
    const dirLabel = language === 'zh' ? '选择的创新方向及方案' : 'Selected innovation direction & plan';
    const suffix = language === 'zh' ? '请基于以上需求感知分析，帮我把这个创新方向发展成为完整的产品方案。务必紧扣分析中发现的需求缺口和用户核心诉求。' : 'Based on the need sensing analysis above, please develop this innovation direction into a complete product plan. Make sure to address the identified gaps and core user needs.';

    // 只传递精简摘要（核心需求 + 选中方向），不传递完整分析全文以节省token
    setUserInput(`${prefix}\n\n${userNeedLabel}：${data.userNeed}\n\n${dirLabel}：${data.selectedDirectionTitle}\n\n${data.selectedDirection}\n\n${suffix}`);
    setStage('input');
  };

  const generateInitialIdea = async () => {
    if (!userInput.trim()) return;

    // 自动创建项目（跳过需求感知直接输入时；游客不落盘）
    if (!projectId && isAuthenticated) {
      const title = userInput.slice(0, 40).replace(/\n/g, ' ');
      createNewProject(title || undefined);
    }

    setIsGenerating(true);
    setInitialIdea('');
    
    try {
      const response = await fetch('/api/generate-initial-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput, language }),
      });

      if (!response.ok) throw new Error('Generation failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Cannot read response');

      const decoder = new TextDecoder();
      let accumulatedContent = '';

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
                throw new Error(t('error.llmService'));
              }
              if (data.content) {
                accumulatedContent += data.content;
                setInitialIdea(accumulatedContent);
              }
            } catch (e) {
              if (e instanceof Error && e.message === t('error.llmService')) {
                throw e;
              }
            }
          }
        }
      }

      setStage('initial-idea');
    } catch (error) {
      console.error('Error:', error);
      toast.error(t('error.generate'));
    } finally {
      setIsGenerating(false);
    }
  };

  const confirmInitialIdea = () => {
    setStage('expert-review');
  };

  const editInitialIdea = (newContent: string) => {
    setInitialIdea(newContent);
  };

  const confirmExpertReports = (reports: Partial<Record<ExpertType, ExpertReport>>) => {
    setExpertReports(reports);
    setShowAdviceSummary(true);
  };

  const proceedToSynthesis = () => {
    setShowAdviceSummary(false);
    setStage('synthesis');
  };

  const backToExpertReview = () => {
    setShowAdviceSummary(false);
  };

  const backFromExpertReview = () => {
    setStage('initial-idea');
  };

  const generateSynthesis = async () => {
    setIsGenerating(true);
    setFinalDocument('');
    setSynthesisProgress('');
    
    try {
      const response = await fetch('/api/generate-synthesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput, initialIdea, expertReports, needSensingData, language }),
      });

      if (!response.ok) throw new Error('Generation failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Cannot read response');

      const decoder = new TextDecoder();
      let accumulatedContent = '';

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
                throw new Error(t('error.llmService'));
              }
              if (data.content) {
                accumulatedContent += data.content;
                setFinalDocument(accumulatedContent);
                // 统计 [SECTION_COMPLETE] 标记数量以显示进度
                const sectionCount = (accumulatedContent.match(/\[SECTION_COMPLETE\]/g) || []).length;
                if (sectionCount > 0) {
                  setSynthesisProgress(language === 'zh'
                    ? `已完成 ${sectionCount}/7 个章节`
                    : `${sectionCount}/7 sections completed`);
                }
              }
            } catch (e) {
              if (e instanceof Error && e.message === t('error.llmService')) {
                throw e;
              }
            }
          }
        }
      }

      // 合成完成，自动保存已通过 useProject hook 处理
    } catch (error) {
      console.error('Error:', error);
      toast.error(t('error.generate'));
    } finally {
      setIsGenerating(false);
    }
  };

  const extractProductName = (): string => {
    if (initialIdea) {
      const zhMatch = initialIdea.match(/(?:产品名称|产品名|项目名称)[:：]\s*(.+?)(?:\n|$)/i);
      const enMatch = initialIdea.match(/(?:Product Name|Project Name)[:：]\s*(.+?)(?:\n|$)/i);
      const match = zhMatch || enMatch;
      if (match && match[1]) return match[1].trim().substring(0, 20);
    }
    
    if (userInput) {
      const zhKw = userInput.match(/(?:做|开发|构建|打造)\s*(.+?)(?:APP|应用|平台|系统|产品)/i);
      const enKw = userInput.match(/(?:build|create|develop|make)\s+(?:a\s+)?(.+?)(?:app|application|platform|system|product)/i);
      const keywords = zhKw || enKw;
      if (keywords && keywords[1]) return keywords[1].trim().substring(0, 20);
    }
    
    return t('export.productName');
  };

  const exportInitialIdea = () => {
    const productName = extractProductName();
    const date = new Date().toISOString().split('T')[0];
    const ideaLabel = t('export.initialConcept');
    const dateLabel = t('export.generateDate');
    const origLabel = t('export.originalIdea');
    const aiLabel = language === 'zh' ? 'AI生成的初步方案' : 'AI-Generated Initial Plan';
    const content = `# ${ideaLabel}\n\n## ${dateLabel}\n${date}\n\n## ${origLabel}\n${userInput}\n\n## ${aiLabel}\n${initialIdea}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${productName}_${t('export.initialConcept')}_${date}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportMarkdown = () => {
    const productName = extractProductName();
    const date = new Date().toISOString().split('T')[0];
    const planLabel = language === 'zh' ? '产品综合商业计划与需求文档' : 'Product Business Plan & Requirements Document';
    const dateLabel = t('export.generateDate');
    const origLabel = t('export.originalIdea');
    const ideaLabel = t('export.initialConceptSection');
    const content = `# ${planLabel}\n\n## ${dateLabel}\n${date}\n\n## ${origLabel}\n${userInput}\n\n## ${ideaLabel}\n${initialIdea}\n\n${finalDocument}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${productName}_${t('export.finalPlan')}_${date}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCompleteDocument = () => {
    const productName = extractProductName();
    const date = new Date().toISOString().split('T')[0];
    
    let content = `# ${productName} - ${t('export.ultimate')}\n\n**${t('export.generateDate')}**: ${date}\n\n---\n\n`;
    
    if (needSensingData) {
      content += `## ${t('export.needSensing')}\n\n`;
      content += `### ${t('export.userNeed')}\n\n${needSensingData.userNeed}\n\n`;
      content += `### ${t('export.aiAnalysis')}\n\n${needSensingData.analysisResult}\n\n`;
      content += `### ${t('export.selectedDirection')}\n\n**${needSensingData.selectedDirectionTitle}**\n\n`;
      
      if (needSensingData.selectedMethodIds && needSensingData.selectedMethodIds.length > 0) {
        content += `### ${t('export.methodsUsed')}\n\n`;
        needSensingData.selectedMethodIds.forEach((methodId: string) => {
          const method = INNOVATION_METHODS.find(m => m.id === methodId);
          if (method) {
            const customPrompt = needSensingData.customMethodPrompts?.[methodId];
            content += `#### ${method.icon} ${method.fullName}\n\n`;
            content += `**${t('export.description')}**：${method.description}\n\n`;
            if (customPrompt) {
              content += `**${t('export.customPrompt')}**：\n\`\`\`\n${customPrompt}\n\`\`\`\n\n`;
            } else {
              content += `**${t('export.defaultPrompt')}**：\n\`\`\`\n${method.prompt}\n\`\`\`\n\n`;
            }
          }
        });
      }
      
      content += `---\n\n`;
    }
    
    content += `## ${t('export.originalIdea')}\n\n${userInput}\n\n`;
    content += `## ${t('export.initialConceptSection')}\n\n${initialIdea}\n\n`;
    content += `## ${t('export.expertSection')}\n\n`;
    EXPERTS.forEach((expert, index) => {
      const report = expertReports[expert.id];
      if (report) {
        const expertName = t(`expert.${expert.id}` as keyof typeof import('@/lib/i18n').translations);
        content += `### ${index + 1}. ${expertName} - ${expert.title}\n\n`;
        
        if (report.rawContent) {
          content += `#### ${t('export.rawReportLabel')}\n\n${report.rawContent}\n\n`;
        }

        content += `#### ${t('export.acceptedOpinions')}\n\n`;

        const checkedOpinions = report.opinions.filter((item: AdviceItem) => item.checked);
        if (checkedOpinions.length > 0) {
          checkedOpinions.forEach((item: AdviceItem) => {
            const priorityLabel = item.priority === 'high' ? '⭐' : item.priority === 'low' ? '○' : '·';
            content += `- ${priorityLabel} ${item.content}\n`;
          });
          content += '\n';
        }
        
        content += `---\n\n`;
      }
    });
    
    content += `## ${t('export.finalSection')}\n\n${finalDocument}\n\n`;
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${productName}_${t('export.ultimate')}_${date}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setStage('need-sensing');
    setUserInput('');
    setInitialIdea('');
    setExpertReports({});
    setFinalDocument('');
    setShowAdviceSummary(false);
    setSelectedDirection(null);
    setNeedSensingData(null);
  };

  const getExpertAcceptedCount = (report: ExpertReport | undefined): number => {
    if (!report) return 0;
    return report.opinions.filter((item: AdviceItem) => item.checked).length;
  };

  const calculateProgress = () => {
    if (stage === 'need-sensing') return 0;
    if (stage === 'input') return 10;
    if (stage === 'initial-idea') return 20;
    if (stage === 'expert-review') {
      if (showAdviceSummary) return 40;
      return 30;
    }
    if (stage === 'synthesis') return 100;
    return 0;
  };

  const getStageLabel = (s: WorkflowStage) => {
    const labels: Record<WorkflowStage, string> = {
      'need-sensing': t('progress.needSensing'),
      'input': t('progress.input'),
      'initial-idea': t('progress.initialIdea'),
      'expert-review': t('progress.expertReview'),
      'synthesis': t('progress.synthesis'),
    };
    return labels[s];
  };

  return (
    <div className="min-h-screen bg-slate-950" suppressHydrationWarning>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-orange-600 rounded-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white" suppressHydrationWarning>
              {t('app.title')}
            </h1>
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
              className="ml-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-sm"
              title={language === 'zh' ? 'Switch to English' : '切换到中文'}
            >
              <Globe className="w-4 h-4" />
              {language === 'zh' ? 'EN' : '中'}
            </button>

            {/* Admin Link */}
            {isAdmin && (
              <Link
                href="/admin"
                className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-orange-400 hover:bg-slate-700 hover:text-orange-300 transition-colors text-sm"
              >
                <Shield className="w-4 h-4" />
                {t('admin.title') || '管理'}
              </Link>
            )}

            {isAuthenticated ? (
              <>
                {/* Logout */}
                <button
                  onClick={logout}
                  className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  {user?.username || ''}
                </button>

                {/* Projects */}
                <div className="ml-2">
                  <ProjectList
                    projectList={projectList}
                    isLoading={isLoadingList}
                    onOpenProject={handleOpenProject}
                    onDeleteProject={handleDeleteProject}
                    onNewProject={handleNewProject}
                  />
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-sm"
              >
                <LogIn className="w-4 h-4" />
                {t('auth.loginButton') || '登录'}
              </Link>
            )}
          </div>
          <p className="text-slate-400 text-lg">IdeaForge - {t('app.subtitle')}</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">{t('progress.label')}</span>
            <span className="text-sm text-slate-400">{Math.round(calculateProgress())}%</span>
          </div>
          <Progress value={calculateProgress()} className="h-2 bg-slate-800" />
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span className={stage === 'need-sensing' ? 'text-orange-400 font-medium' : ''}>{t('progress.needSensing')}</span>
            <span className={stage === 'input' ? 'text-orange-400 font-medium' : ''}>{t('progress.input')}</span>
            <span className={stage === 'initial-idea' ? 'text-orange-400 font-medium' : ''}>{t('progress.initialIdea')}</span>
            <span className={stage === 'expert-review' ? 'text-orange-400 font-medium' : ''}>{t('progress.expertReview')}</span>
            <span className={stage === 'synthesis' ? 'text-orange-400 font-medium' : ''}>{t('progress.synthesis')}</span>
          </div>
        </div>

        {/* Onboarding Guide (first-time only) */}
        <OnboardingGuide />

        {/* Main Content */}
        <div className="space-y-6">
          {/* Stage 0: Need Sensing */}
          {stage === 'need-sensing' && (
            <NeedSensing
              onSkip={skipNeedSensing}
              onSelectDirection={selectDirection}
              methods={INNOVATION_METHODS}
            />
          )}

          {/* Stage 1: Input */}
          {stage === 'input' && (
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  {t('input.title')}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {t('input.desc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder={t('input.placeholder')}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="min-h-[200px] bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-orange-500"
                />
                <div className="flex justify-between items-center">
                  <Button variant="outline" onClick={() => setStage('need-sensing')} className="border-slate-600 text-slate-300">
                    <Search className="w-4 h-4 mr-2" />
                    {t('input.backToSensing')}
                  </Button>
                  <div className="flex items-center gap-4">
                    {selectedDirection && (
                      <p className="text-sm text-cyan-400">
                        ✓ {t('input.directionSelected')}
                      </p>
                    )}
                    <Button
                      onClick={generateInitialIdea}
                      disabled={!userInput.trim() || isGenerating}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('input.thinking')}
                        </>
                      ) : (
                        <>
                          {t('input.start')}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stage 2: Initial Idea */}
          {stage === 'initial-idea' && (
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <FileText className="w-5 h-5 text-blue-400" />
                  {t('idea.title')}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {t('idea.desc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
                  <Textarea
                    value={initialIdea}
                    onChange={(e) => editInitialIdea(e.target.value)}
                    className="min-h-[400px] bg-transparent border-none text-white resize-none focus-visible:ring-0 p-0"
                    placeholder={t('idea.placeholder')}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStage('input')} className="border-slate-600 text-slate-300">
                      {t('idea.back')}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={exportInitialIdea} 
                      className="border-slate-600 text-slate-300"
                      disabled={!initialIdea.trim()}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t('idea.exportMd')}
                    </Button>
                  </div>
                  <Button
                    onClick={confirmInitialIdea}
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                  >
                    {t('idea.confirm')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stage 3: Expert Review */}
          {stage === 'expert-review' && !showAdviceSummary && (
            <ExpertReviewPanel
              userInput={userInput}
              initialIdea={initialIdea}
              onConfirm={confirmExpertReports}
              onBack={backFromExpertReview}
            />
          )}

          {/* Advice Summary (bridge between expert review and synthesis) */}
          {stage === 'expert-review' && showAdviceSummary && (
            <AdviceSummaryPanel
              expertReports={expertReports}
              onUpdateReports={setExpertReports}
              onProceedToSynthesis={proceedToSynthesis}
              onBackToReview={backToExpertReview}
            />
          )}

          {/* Stage 4: Synthesis */}
          {stage === 'synthesis' && (
            <SynthesisPanel
              finalDocument={finalDocument}
              isGenerating={isGenerating}
              progressText={synthesisProgress}
              onGenerate={generateSynthesis}
              onReset={reset}
              onExportMarkdown={exportMarkdown}
              onExportComplete={exportCompleteDocument}
            />
          )}
        </div>
      </div>
    </div>
  );
}
