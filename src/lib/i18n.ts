// ============================================================
// 国际化配置 - 中英文翻译表
// ============================================================

export type Language = 'zh' | 'en';

export const translations = {
  // === 全局 ===
  'app.title': { zh: '灵感锻造炉', en: 'IdeaForge' },
  'app.subtitle': { zh: '将你的毛坯想法锻造为成熟产品方案', en: 'Forge your raw ideas into polished product solutions' },
  'app.footer': { zh: '灵感锻造炉 IdeaForge - AI虚拟产品委员会', en: 'IdeaForge - AI Virtual Product Committee' },

  // === 进度 ===
  'progress.label': { zh: '锻造进度', en: 'Progress' },
  'progress.needSensing': { zh: '需求感知', en: 'Need Sensing' },
  'progress.input': { zh: '灵感输入', en: 'Idea Input' },
  'progress.initialIdea': { zh: '初步构想', en: 'Initial Concept' },
  'progress.expertReview': { zh: '专家考验', en: 'Expert Review' },
  'progress.synthesis': { zh: '终极熔铸', en: 'Final Synthesis' },

  // === 阶段标签 ===
  'stage.needSensing': { zh: '需求感知', en: 'Need Sensing' },
  'stage.input': { zh: '灵感输入', en: 'Idea Input' },
  'stage.initialIdea': { zh: '初步构想', en: 'Initial Concept' },
  'stage.expertReview': { zh: '专业考验', en: 'Expert Review' },
  'stage.synthesis': { zh: '终极熔铸', en: 'Final Synthesis' },

  // === 阶段一：灵感输入 ===
  'input.title': { zh: '阶段一：灵感输入', en: 'Phase 1: Idea Input' },
  'input.desc': { zh: '用大白话描述你的产品想法，可以是模糊的、不完整的。我们会帮你完善它。', en: 'Describe your product idea in plain language. It can be vague or incomplete. We will help you refine it.' },
  'input.placeholder': { zh: '例如：我想要做一款帮助程序员管理碎片化时间的APP，解决他们在多任务切换时容易忘记重要事项的问题...', en: 'e.g., I want to build an app that helps programmers manage fragmented time, solving the problem of forgetting important tasks when switching between multiple tasks...' },
  'input.backToSensing': { zh: '返回需求感知', en: 'Back to Need Sensing' },
  'input.directionSelected': { zh: '已选择创新方向', en: 'Direction selected' },
  'input.start': { zh: '开始构思', en: 'Start Ideation' },
  'input.thinking': { zh: '构思中...', en: 'Thinking...' },

  // === 阶段二：初步构想 ===
  'idea.title': { zh: '阶段二：初步构想', en: 'Phase 2: Initial Concept' },
  'idea.desc': { zh: 'AI根据你的想法生成的初步产品方案。你可以直接修改内容，确认后将进入专家考验阶段。', en: 'AI-generated initial product concept based on your idea. You can edit the content directly. After confirmation, you will enter the expert review phase.' },
  'idea.placeholder': { zh: '等待AI生成...', en: 'Waiting for AI to generate...' },
  'idea.back': { zh: '返回修改', en: 'Back to Edit' },
  'idea.exportMd': { zh: '导出Markdown', en: 'Export Markdown' },
  'idea.confirm': { zh: '确认并进入专家考验', en: 'Confirm & Enter Expert Review' },

  // === 阶段三：专业考验 ===
  'expert.title': { zh: '阶段三：专业考验', en: 'Phase 3: Expert Review' },
  'expert.desc': { zh: '五位专家将依次对你的产品方案进行严厉审视。每位专家的报告都可以修改后确认。', en: 'Five experts will scrutinize your product plan one by one. Each expert\'s report can be modified before confirmation.' },
  'expert.accepted': { zh: '条认可', en: ' accepted' },

  // === 阶段四：终极熔铸 ===
  'synthesis.title': { zh: '阶段四：终极熔铸', en: 'Phase 4: Final Synthesis' },
  'synthesis.desc': { zh: '综合所有专家的观点，生成最终的《产品综合商业计划与需求文档》', en: 'Synthesize all expert perspectives into the final Product Business Plan & Requirements Document' },
  'synthesis.ready': { zh: '五位专家已完成评审，现在可以生成最终的综合方案', en: 'All five experts have completed their reviews. You can now generate the final synthesis.' },
  'synthesis.generate': { zh: '一键生成综合方案', en: 'Generate Final Plan' },
  'synthesis.generating': { zh: '正在生成...', en: 'Generating...' },
  'synthesis.restart': { zh: '重新开始', en: 'Start Over' },
  'synthesis.restartConfirmTitle': { zh: '确认重新开始？', en: 'Confirm Restart?' },
  'synthesis.restartConfirmDesc': { zh: '所有当前进度和生成结果将被清除，此操作不可撤销。', en: 'All progress and generated content will be lost. This cannot be undone.' },
  'synthesis.restartCancel': { zh: '取消', en: 'Cancel' },
  'synthesis.restartConfirm': { zh: '确认重置', en: 'Confirm Reset' },
  'synthesis.exportFinal': { zh: '导出最终报告', en: 'Export Final Report' },
  'synthesis.regenerate': { zh: '重新生成', en: 'Regenerate' },
  'synthesis.downloadAll': { zh: '下载完整材料（包含所有过程文档）', en: 'Download Complete Materials (includes all process documents)' },
  'synthesis.downloadAllDesc': { zh: '包含：用户输入、初步构想、专家报告、最终方案', en: 'Includes: User input, initial concept, expert reports, final plan' },

  // === 意见汇总面板 ===
  'adviceSummary.title': { zh: '意见汇总', en: 'Advice Summary' },
  'adviceSummary.desc': { zh: '以下意见将进入终极熔铸，请做最后确认', en: 'The following opinions will be incorporated into the final synthesis' },
  'adviceSummary.itemsCount': { zh: '条', en: ' items' },
  'adviceSummary.proceedToGenerate': { zh: '确认并进入终极熔铸', en: 'Confirm & Proceed to Synthesis' },
  'adviceSummary.stats': { zh: '共 {total} 条（⭐高优 {high} · 中优 {medium} · ○低优 {low}）', en: '{total} items (⭐{high} high · {medium} medium · {low} low)' },
  'adviceSummary.backToModify': { zh: '返回修改', en: 'Back to Review' },
  'adviceSummary.priorityHigh': { zh: '高优', en: 'High' },
  'adviceSummary.priorityMedium': { zh: '中优', en: 'Medium' },
  'adviceSummary.priorityLow': { zh: '低优', en: 'Low' },
  'adviceSummary.remove': { zh: '移除', en: 'Remove' },
  'adviceSummary.empty': { zh: '没有已采纳的意见。请返回专家评审至少勾选一条意见。', en: 'No accepted opinions. Please go back and check at least one.' },
  'adviceSummary.totalLabel': { zh: '共', en: 'Total' },

  // === 需求感知 ===
  'sensing.title': { zh: '需求感知', en: 'Need Sensing' },
  'sensing.subtitle': { zh: '运用创新方法论深度分析你的需求，找到最佳创新方向', en: 'Use innovation methodologies to deeply analyze your needs and find the best direction' },
  'sensing.inputLabel': { zh: '描述你的需求或痛点', en: 'Describe your need or pain point' },
  'sensing.placeholder': { zh: '用一句话描述你想解决的问题或满足的需求...', en: 'Describe the problem you want to solve or the need you want to address in one sentence...' },
  'sensing.analyze': { zh: '分析需求', en: 'Analyze Needs' },
  'sensing.analyzing': { zh: '正在分析...', en: 'Analyzing...' },
  'sensing.skip': { zh: '跳过需求感知', en: 'Skip Need Sensing' },
  'sensing.skipDesc': { zh: '直接输入你的想法', en: 'Enter your idea directly' },
  'sensing.methodSelect': { zh: '选择创新方法论', en: 'Select Innovation Methods' },
  'sensing.methodCustom': { zh: '已自定义', en: 'Customized' },
  'sensing.editPrompt': { zh: '编辑Prompt', en: 'Edit Prompt' },
  'sensing.resetPrompt': { zh: '恢复默认', en: 'Reset Default' },
  'sensing.collapse': { zh: '收起', en: 'Collapse' },
  'sensing.expand': { zh: '展开', en: 'Expand' },
  'sensing.selected': { zh: '已选', en: 'Selected' },
  'sensing.directions': { zh: '创新方向', en: 'Innovation Directions' },
  'sensing.selectDirection': { zh: '选择此方向', en: 'Select This Direction' },
  'sensing.atLeastOne': { zh: '请至少选择一种方法论', en: 'Please select at least one method' },

  // === 专家评审面板 ===
  'expertReview.panelDesc': { zh: '五位专家正在对方案进行独立评审，每位专家从自己的专业领域出发给出意见', en: 'Five experts are independently reviewing the plan, each offering opinions from their domain.' },
  'expertReview.generating': { zh: '正在生成...', en: 'Generating...' },
  'expertReview.analyzing': { zh: '专家正在分析方案...', en: 'Expert is analyzing the plan...' },
  'expertReview.noOpinions': { zh: '暂无意见', en: 'No opinions yet' },
  'expertReview.addCustom': { zh: '添加自定义意见', en: 'Add Custom Opinion' },
  'expertReview.accepted': { zh: '已采纳', en: 'Accepted' },
  'expertReview.confirmToSummary': { zh: '确认并进入意见汇总', en: 'Confirm & Enter Advice Summary' },
  'expertReview.waitingAll': { zh: '等待专家评审完成...', en: 'Waiting for all experts...' },
  'expertReview.pending': { zh: '等待中', en: 'Pending' },
  'expertReview.done': { zh: '已完成', en: 'Done' },
  'expertReview.opinionsCount': { zh: '条意见', en: ' opinions' },
  'expertReview.priorityTooltip': { zh: '点击切换优先级（高→中→低→无）', en: 'Click to cycle priority (High→Medium→Low→None)' },

  // === 专家评审 ===
  'review.rawReport': { zh: '原始报告', en: 'Raw Report' },
  'review.advicePanel': { zh: '评审意见', en: 'Review Opinions' },
  'review.redFlag': { zh: '致命缺陷', en: 'Fatal Flaw' },
  'review.greenLight': { zh: '核心机遇', en: 'Core Opportunity' },
  'review.advice': { zh: '重构建议', en: 'Reconstruction Advice' },
  'review.addCustom': { zh: '添加自定义意见', en: 'Add Custom Opinion' },
  'review.confirm': { zh: '确认报告', en: 'Confirm Report' },
  'review.generating': { zh: '正在生成专家报告...', en: 'Generating expert report...' },
  'review.empty': { zh: '暂无意见，报告生成后将自动解析', en: 'No opinions yet. They will be auto-parsed after the report is generated.' },
  'review.selectAll': { zh: '全选', en: 'Select All' },

  // === 导出文件 ===
  'export.productName': { zh: '产品方案', en: 'Product Plan' },
  'export.initialConcept': { zh: '初步构想', en: 'Initial Concept' },
  'export.finalPlan': { zh: '综合方案', en: 'Final Plan' },
  'export.ultimate': { zh: '终极版', en: 'Ultimate Edition' },
  'export.needSensing': { zh: '零、需求感知', en: '0. Need Sensing' },
  'export.userNeed': { zh: '用户需求描述', en: 'User Need Description' },
  'export.aiAnalysis': { zh: 'AI需求分析', en: 'AI Needs Analysis' },
  'export.selectedDirection': { zh: '选择的创新方向', en: 'Selected Innovation Direction' },
  'export.methodsUsed': { zh: '运用的创新方法论', en: 'Innovation Methods Applied' },
  'export.customPrompt': { zh: '自定义思考指令', en: 'Custom Thinking Instructions' },
  'export.defaultPrompt': { zh: '默认思考指令', en: 'Default Thinking Instructions' },
  'export.originalIdea': { zh: '一、用户原始想法', en: '1. Original User Idea' },
  'export.initialConceptSection': { zh: '二、初步构想', en: '2. Initial Concept' },
  'export.expertSection': { zh: '三、专家考验报告', en: '3. Expert Review Reports' },
  'export.rawReportLabel': { zh: '原始报告', en: 'Raw Report' },
  'export.acceptedOpinions': { zh: '被采纳的意见', en: 'Accepted Opinions' },
  'export.finalSection': { zh: '四、终极熔铸 - 产品综合商业计划与需求文档', en: '4. Final Synthesis - Product Business Plan & Requirements Document' },
  'export.generateDate': { zh: '生成日期', en: 'Generated Date' },
  'export.description': { zh: '描述', en: 'Description' },

  // === 错误 ===
  'error.generate': { zh: '生成失败，请重试', en: 'Generation failed. Please retry.' },
  'error.llmService': { zh: 'AI服务暂时不可用，请稍后重试', en: 'AI service is temporarily unavailable. Please try again later.' },

  // === 专家名称 ===
  'expert.product-architect': { zh: '产品策划专家', en: 'Product Architect' },
  'expert.market-analyst': { zh: '市场预测专家', en: 'Market Analyst' },
  'expert.tech-lead': { zh: '技术实现专家', en: 'Tech Lead' },
  'expert.ux-ui-director': { zh: '产品视觉设计专家', en: 'UX/UI Director' },
  'expert.growth-hacker': { zh: '产品营销专家', en: 'Growth Hacker' },

  // === 专家描述 ===
  'expertDesc.product-architect': { zh: '逻辑严密、关注核心需求。批判伪需求、逻辑漏洞、功能堆砌。', en: 'Rigorous logic, focused on core needs. Critical of pseudo-needs, logic holes, and feature bloat.' },
  'expertDesc.market-analyst': { zh: '商业嗅觉敏锐、数据驱动。批判市场空间狭小、竞品分析缺失、定位模糊。', en: 'Keen business sense, data-driven. Critical of narrow markets, missing competitive analysis, and vague positioning.' },
  'expertDesc.tech-lead': { zh: '务实、关注架构与实现成本。批判技术幻想、性能瓶颈、开发周期过长。', en: 'Pragmatic, focused on architecture and cost. Critical of tech fantasies, performance bottlenecks, and long dev cycles.' },
  'expertDesc.ux-ui-director': { zh: '审美极高、关注用户体验与交互心理学。批判交互繁琐、视觉焦点混乱、缺乏美感。', en: 'High aesthetic standards, focused on UX and interaction psychology. Critical of cumbersome interactions and visual chaos.' },
  'expertDesc.growth-hacker': { zh: '结果导向、精通传播与增长黑客。批判缺乏自传播力、获客成本高昂。', en: 'Results-oriented, expert in viral growth. Critical of poor virality and high customer acquisition costs.' },

  // === 认证 ===
  'auth.loginTitle': { zh: '登录', en: 'Login' },
  'auth.loginSubtitle': { zh: '登录以使用灵感锻造炉', en: 'Login to use IdeaForge' },
  'auth.username': { zh: '用户名', en: 'Username' },
  'auth.password': { zh: '密码', en: 'Password' },
  'auth.loginButton': { zh: '登录', en: 'Sign In' },
  'auth.loggingIn': { zh: '登录中...', en: 'Signing in...' },
  'auth.loginError': { zh: '用户名或密码错误', en: 'Invalid username or password' },
  'auth.logout': { zh: '退出登录', en: 'Logout' },
  'auth.loggedInAs': { zh: '当前用户', en: 'Logged in as' },

  // === 管理员 ===
  'admin.title': { zh: '用户管理', en: 'User Management' },
  'admin.backToApp': { zh: '返回应用', en: 'Back to App' },
  'admin.addUser': { zh: '添加用户', en: 'Add User' },
  'admin.role': { zh: '角色', en: 'Role' },
  'admin.roleAdmin': { zh: '管理员', en: 'Admin' },
  'admin.roleUser': { zh: '普通用户', en: 'User' },
  'admin.createUser': { zh: '创建用户', en: 'Create User' },
  'admin.username': { zh: '用户名', en: 'Username' },
  'admin.password': { zh: '密码', en: 'Password' },

  // === 语言切换 ===
  'lang.zh': { zh: '中文', en: '中文' },
  'lang.en': { zh: 'English', en: 'English' },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey | string, lang: Language): string {
  const entry = (translations as Record<string, { zh: string; en: string }>)[key as string];
  if (!entry) return key as string;
  return entry[lang] || entry.zh || (key as string);
}
