'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
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
import { ExpertType, ExpertReport, WorkflowStage, AdviceItem, ProblemType } from '@/types';
import { getExperts } from '@/config/experts';
import { PROBLEM_PROFILES } from '@/config/problem-types';
import { SYNTHESIS_SECTION_COUNT } from '@/config/synthesis';
import { readGenerationStream } from '@/lib/generation-stream';
import { GenerationError, getGenerationErrorMessage } from '@/lib/generation-errors';
import { ProblemTypeSelector } from '@/components/problem-type-selector';
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
  const [problemType, setProblemType] = useState<ProblemType>('product');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLegacy, setIsLegacy] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const profile = PROBLEM_PROFILES[problemType];
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
    resetProject,
    deleteProject,
  } = useProject();

  const progress = stage === 'need-sensing' ? 0 : stage === 'input' ? 10
    : stage === 'initial-idea' ? 20 : stage === 'expert-review' ? (showAdviceSummary ? 50 : 35)
    : isCompleted ? 100 : 65;

  // 自动保存：关键状态变更时 save 到服务端
  useEffect(() => {
    if (!projectId || stage === 'need-sensing') return;
    saveProject({
      currentStage: stage,
      progress,
      userInput,
      initialIdea,
      expertReports,
      finalDocument,
      needSensingData,
      showAdviceSummary,
      selectedDirection,
      isCompleted,
      problemType,
      workflowVersion: isLegacy ? 1 : 2,
    });
  }, [stage, userInput, initialIdea, expertReports, finalDocument, needSensingData, showAdviceSummary, selectedDirection, problemType, isCompleted, isLegacy, projectId, saveProject, progress]);

  const handleOpenProject = async (id: string) => {
    const data = await loadProject(id);
    if (!data) return;
    setProblemType(data.problemType);
    setIsLegacy(data.isLegacy);
    setIsCompleted(data.isCompleted);
    setGenerationError('');
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
    if (stage !== 'need-sensing' && (userInput || initialIdea) && !window.confirm(t('page.unsavedConfirm'))) return;
    reset();
  };

  const handleDeleteProject = async (id: string) => { await deleteProject(id); };

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
    const dirLabel = language === 'zh' ? '选择的创新方向及方案' : 'Selected innovation direction & plan';
    const suffix = language === 'zh' ? '请保留原始约束，将此 AI 建议作为待验证方向，形成初步假设与验证思路。' : 'Preserve the original constraints. Treat this AI suggestion as an unvalidated direction and develop initial hypotheses and tests.';

    // 只传递精简摘要（核心需求 + 选中方向），不传递完整分析全文以节省token
    setUserInput(`${prefix}\n\n${userNeedLabel}：${data.userNeed}\n\n${dirLabel}：${data.selectedDirectionTitle}\n\n${data.selectedDirection}\n\n${suffix}`);
    setStage('input');
  };

  const generateInitialIdea = async () => {
    if (!userInput.trim()) return;
    setIsLegacy(false);

    // 自动创建项目（跳过需求感知直接输入时；游客不落盘）
    if (!projectId && isAuthenticated) {
      const title = userInput.slice(0, 40).replace(/\n/g, ' ');
      createNewProject(title || undefined);
    }

    setIsGenerating(true);
    setInitialIdea('');
    setExpertReports({});
    setFinalDocument('');
    setIsCompleted(false);
    setGenerationError('');
    
    try {
      const response = await fetch('/api/generate-initial-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput, problemType, language }),
      });

      let accumulatedContent = '';
      for await (const content of readGenerationStream(response)) {
        accumulatedContent += content;
        setInitialIdea(accumulatedContent);
      }

      setStage('initial-idea');
    } catch (error) {
      console.error('Error:', error);
      const message = getGenerationErrorMessage(error, t);
      setGenerationError(message);
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const confirmInitialIdea = () => {
    setGenerationError('');
    setStage('expert-review');
  };

  const editInitialIdea = (newContent: string) => {
    setInitialIdea(newContent);
    setExpertReports({});
    setFinalDocument('');
    setIsCompleted(false);
  };

  const confirmExpertReports = (reports: Partial<Record<ExpertType, ExpertReport>>) => {
    setExpertReports(reports);
    setFinalDocument('');
    setIsCompleted(false);
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
    setIsCompleted(false);
    setGenerationError('');
    
    try {
      const response = await fetch('/api/generate-synthesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput, initialIdea, expertReports, needSensingData, problemType, language }),
      });

      let accumulatedContent = '';
      for await (const content of readGenerationStream(response)) {
        accumulatedContent += content;
        setFinalDocument(accumulatedContent);
        const sectionCount = (accumulatedContent.match(/\[SECTION_COMPLETE\]/g) || []).length;
        setSynthesisProgress(language === 'zh'
          ? `已完成 ${Math.min(sectionCount, SYNTHESIS_SECTION_COUNT)}/${SYNTHESIS_SECTION_COUNT} 个章节`
          : `${Math.min(sectionCount, SYNTHESIS_SECTION_COUNT)}/${SYNTHESIS_SECTION_COUNT} sections completed`);
      }
      if ((accumulatedContent.match(/\[SECTION_COMPLETE\]/g) || []).length !== SYNTHESIS_SECTION_COUNT) {
        throw new GenerationError('STREAM_INTERRUPTED', 'The plan is incomplete.');
      }
      setIsCompleted(true);
      setIsLegacy(false);
      // 合成完成，自动保存已通过 useProject hook 处理
    } catch (error) {
      console.error('Error:', error);
      const message = getGenerationErrorMessage(error, t);
      setGenerationError(message);
      toast.error(message);
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
    const blob = new Blob([content.replace(/\[SECTION_COMPLETE\]/g, '')], { type: 'text/markdown' });
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
    const planLabel = profile.deliverable[language] + (isCompleted ? '' : (language === 'zh' ? '（未完成草稿）' : ' (Incomplete draft)'));
    const dateLabel = t('export.generateDate');
    const origLabel = t('export.originalIdea');
    const ideaLabel = t('export.initialConceptSection');
    const content = `# ${planLabel}\n\n## ${dateLabel}\n${date}\n\n## ${origLabel}\n${userInput}\n\n## ${ideaLabel}\n${initialIdea}\n\n${finalDocument}`;
    const blob = new Blob([content.replace(/\[SECTION_COMPLETE\]/g, '')], { type: 'text/markdown' });
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
    
    let content = `# ${productName} - ${profile.deliverable[language]}\n\n${isCompleted ? '' : (language === 'zh' ? '未完成草稿\n\n' : 'Incomplete draft\n\n')}**${t('export.generateDate')}**: ${date}\n\n---\n\n`;
    
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
    getExperts(problemType).forEach((expert, index) => {
      const report = expertReports[expert.id];
      if (report) {
        const expertName = language === 'zh' ? expert.name : expert.title;
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
    
    content += `## ${profile.deliverable[language]}\n\n${finalDocument}\n\n`;
    
    const blob = new Blob([content.replace(/\[SECTION_COMPLETE\]/g, '')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${productName}_${t('export.ultimate')}_${date}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    resetProject();
    setIsLegacy(false);
    setIsCompleted(false);
    setGenerationError('');
    setStage('need-sensing');
    setUserInput('');
    setInitialIdea('');
    setExpertReports({});
    setFinalDocument('');
    setShowAdviceSummary(false);
    setSelectedDirection(null);
    setNeedSensingData(null);
  };

  const changeProblemType = (value: ProblemType) => {
    if (value === problemType) return;
    setProblemType(value);
    setInitialIdea('');
    setExpertReports({});
    setFinalDocument('');
    setNeedSensingData(null);
    setSelectedDirection(null);
    setIsCompleted(false);
    setGenerationError('');
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
            <span className="text-sm text-slate-400">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-slate-800" />
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
          {generationError && <p role="alert" className="rounded-lg border border-red-800 bg-red-950/30 p-3 text-sm text-red-300">{generationError}</p>}
          {isLegacy && <p className="rounded-lg border border-amber-700 p-3 text-sm text-amber-300">{language === 'zh' ? '此项目来自旧版流程，原有草稿已保留。请重新生成验证计划后再用于评审。' : 'This project uses the previous workflow. Its drafts are preserved; regenerate a validation plan before review.'}</p>}
          {stage !== 'need-sensing' && stage !== 'input' && (
            <div className="text-sm text-orange-300">{profile.label[language]} · {profile.deliverable[language]}</div>
          )}
          {/* Stage 0: Need Sensing */}
          {stage === 'need-sensing' && (
            <NeedSensing
              problemType={problemType}
              onProblemTypeChange={changeProblemType}
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
                  {profile.description[language]}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProblemTypeSelector value={problemType} onChange={changeProblemType} disabled={isGenerating} />
                <Textarea
                  placeholder={profile.placeholder[language]}
                  disabled={isGenerating}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="min-h-[200px] bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-orange-500"
                />
                <div className="flex justify-between items-center">
                  <Button variant="outline" disabled={isGenerating} onClick={() => setStage('need-sensing')} className="border-slate-600 text-slate-300">
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
              key={`${projectId || 'guest'}-${problemType}`}
              problemType={problemType}
              initialReports={expertReports}
              userInput={userInput}
              initialIdea={initialIdea}
              onConfirm={confirmExpertReports}
              onBack={backFromExpertReview}
            />
          )}

          {/* Advice Summary (bridge between expert review and synthesis) */}
          {stage === 'expert-review' && showAdviceSummary && (
            <AdviceSummaryPanel
              key={`${projectId || 'guest'}-${problemType}`}
              problemType={problemType}
              expertReports={expertReports}
              onUpdateReports={setExpertReports}
              onProceedToSynthesis={proceedToSynthesis}
              onBackToReview={backToExpertReview}
            />
          )}

          {/* Stage 4: Synthesis */}
          {stage === 'synthesis' && (
            <SynthesisPanel
              problemType={problemType}
              isCompleted={isCompleted}
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
