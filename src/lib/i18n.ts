// ============================================================
// 国际化配置 - 中英文翻译表
// ============================================================

export type Language = 'zh' | 'en';

export const translations = {
  'review.riskRetention': { zh: '未勾选或删除意见不代表风险已经解除。原始评审会保留，关键风险及证据缺口仍需在最终计划中交代。', en: 'Deselecting or deleting an opinion does not resolve its risk. Original reviews are retained so the final plan can address key risks and evidence gaps.' },
  // === 全局 ===
  'app.title': { zh: '灵感锻造炉', en: 'IdeaForge' },
  'app.subtitle': { zh: "把问题与构想转化为可检验的行动计划", en: "Turn problems and ideas into testable action plans" },
  'app.footer': { zh: "灵感锻造炉 IdeaForge - AI 多视角评审", en: "IdeaForge - AI Review Perspectives" },

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
  'input.desc': { zh: "描述要解决的问题、已有证据和约束。没有数据的部分可以标为待补充。", en: "Describe the problem, available evidence and constraints. Mark missing information as unknown." },
  'input.placeholder': { zh: '例如：我想要做一款帮助程序员管理碎片化时间的APP，解决他们在多任务切换时容易忘记重要事项的问题...', en: 'e.g., I want to build an app that helps programmers manage fragmented time, solving the problem of forgetting important tasks when switching between multiple tasks...' },
  'input.backToSensing': { zh: '返回需求感知', en: 'Back to Need Sensing' },
  'input.directionSelected': { zh: '已选择创新方向', en: 'Direction selected' },
  'input.start': { zh: '开始构思', en: 'Start Ideation' },
  'input.thinking': { zh: '构思中...', en: 'Thinking...' },

  // === 阶段二：初步构想 ===
  'idea.title': { zh: '阶段二：初步构想', en: 'Phase 2: Initial Concept' },
  'idea.desc': { zh: "这是待验证的初步假设。请补充真实数据、修改约束，再进入 AI 评审。", en: "This is an initial hypothesis. Add evidence and correct constraints before AI review." },
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
  'synthesis.desc': { zh: "按需求类型生成产品验证计划或工程试验方案与验收指标。", en: "Generate a product validation plan or an engineering test plan and acceptance criteria." },
  'synthesis.ready': { zh: "根据评审记录生成验证计划，并保留未解决风险。", en: "Build a validation plan from the review records, retaining unresolved risks." },
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
  'adviceSummary.desc': { zh: "勾选表示希望纳入行动计划；优先级用于安排验证顺序。", en: "Selected opinions guide the action plan; priority determines the order of validation." },
  'adviceSummary.itemsCount': { zh: '条', en: ' items' },
  'adviceSummary.proceedToGenerate': { zh: '确认并进入终极熔铸', en: 'Confirm & Proceed to Synthesis' },
  'adviceSummary.stats': { zh: '共 {total} 条（⭐高优 {high} · 中优 {medium} · ○低优 {low}）', en: '{total} items (⭐{high} high · {medium} medium · {low} low)' },
  'adviceSummary.backToModify': { zh: '返回修改', en: 'Back to Review' },
  'adviceSummary.priorityHigh': { zh: '高优', en: 'High' },
  'adviceSummary.priorityMedium': { zh: '中优', en: 'Medium' },
  'adviceSummary.priorityLow': { zh: '低优', en: 'Low' },
  'adviceSummary.remove': { zh: '移除', en: 'Remove' },
  'adviceSummary.empty': { zh: "未选择实施建议。仍可生成以证据缺口与风险验证为主的计划。", en: "No implementation suggestions selected. You can still create a plan to investigate evidence gaps and risks." },
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
  'expertReview.panelDesc': { zh: "同一 AI 服务从五个专业视角审视方案；这些意见不等于五位真人专家的独立验证。", en: "The same AI service reviews the plan from five professional perspectives. These are not independent validations by five human experts." },
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
  'export.finalSection': { zh: "四、终极熔铸 - 验证计划", en: "4. Final Synthesis - Validation Plan" },
  'export.generateDate': { zh: '生成日期', en: 'Generated Date' },
  'export.description': { zh: '描述', en: 'Description' },

  // === 错误 ===
  'error.generate': { zh: '生成失败，请重试', en: 'Generation failed. Please retry.' },
  'error.llmService': { zh: 'AI服务暂时不可用，请稍后重试', en: 'AI service is temporarily unavailable. Please try again later.' },
  'error.missingApiKey': { zh: 'AI 服务尚未配置，请联系网站管理员。', en: 'The AI service is not configured. Please contact the site administrator.' },
  'error.invalidApiKey': { zh: 'DeepSeek API 密钥无效，请联系网站管理员更新密钥。', en: 'The DeepSeek API key is invalid. Please contact the site administrator to update it.' },
  'error.insufficientBalance': { zh: 'DeepSeek API 账户余额不足，请联系网站管理员。', en: 'The DeepSeek API account has insufficient balance. Please contact the site administrator.' },
  'error.invalidAiRequest': { zh: 'AI 服务拒绝了请求，请联系网站管理员检查模型和参数配置。', en: 'The AI service rejected the request. Please contact the site administrator to check the model and parameters.' },
  'error.rateLimited': { zh: 'AI 服务请求过于频繁，请稍后重试。', en: 'The AI service is receiving too many requests. Please try again later.' },
  'error.aiTimeout': { zh: 'AI 服务响应超时，请稍后重试。', en: 'The AI service timed out. Please try again later.' },
  'error.streamInterrupted': { zh: '生成连接中断，已保留收到的内容，请重新生成。', en: 'The generation connection was interrupted. Received content has been kept. Please generate again.' },
  'error.invalidResponse': { zh: 'AI 服务返回的数据不完整或格式异常，请重试。', en: 'The AI service returned an incomplete or invalid response. Please try again.' },

  // === 专家名称 ===
  'expert.product-architect': { zh: "需求与产品验证", en: "Problem & Product Validation" },
  'expert.market-analyst': { zh: "市场与替代方案研究", en: "Market & Alternatives" },
  'expert.tech-lead': { zh: "技术可行性", en: "Technical Feasibility" },
  'expert.ux-ui-director': { zh: "体验与用户测试", en: "Usability & User Testing" },
  'expert.growth-hacker': { zh: "付费与获客验证", en: "Payment & Acquisition Validation" },

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

  // === 引导（Onboarding）===
  'onboarding.welcome': { zh: '欢迎使用灵感锻造炉 IdeaForge', en: 'Welcome to IdeaForge' },
  'onboarding.subtitle': { zh: "先选择产品构思或工程改进，再分阶段定义问题、检查假设和设计验证。", en: "Choose product concept or engineering improvement, then define the problem, review assumptions and design validation." },
  'onboarding.start': { zh: '开始使用', en: 'Get Started' },
  'onboarding.step1.title': { zh: '需求感知', en: 'Need Sensing' },
  'onboarding.step1.desc': { zh: "描述需求与约束，选择适用的创新方法，形成待验证方向和资料缺口。", en: "Describe the need and constraints. Use suitable methods to identify candidate directions and evidence gaps." },
  'onboarding.step2.title': { zh: '灵感输入', en: 'Idea Input' },
  'onboarding.step2.desc': { zh: "补充目标、已有数据和不可突破的约束。可以明确写出未知信息。", en: "Add goals, available data and hard constraints. Unknown information can remain explicit." },
  'onboarding.step3.title': { zh: '初步构想', en: 'Initial Concept' },
  'onboarding.step3.desc': { zh: "AI 生成产品概念或工程改进假设。补充证据、修改内容后进入评审。", en: "AI drafts a product concept or engineering hypothesis. Add evidence and edit it before review." },
  'onboarding.step4.title': { zh: '专家考验', en: 'Expert Review' },
  'onboarding.step4.desc': { zh: "AI 按需求类型切换五个评审视角。选择希望实施的建议，关键风险仍保留待验证。", en: "AI uses five perspectives matched to your problem type. Select actions to pursue; key risks remain open until validated." },
  'onboarding.step5.title': { zh: '终极熔铸', en: 'Final Synthesis' },
  'onboarding.step5.desc': { zh: "产品构思输出假设、用户测试及决策条件；工程改进输出对照试验、测量方法与验收指标。", en: "Product concepts produce hypotheses, user tests and decision gates. Engineering improvements produce controlled tests, measurement methods and acceptance criteria." },

  // === 项目列表 ===
  'projectList.title': { zh: '我的项目', en: 'My Projects' },
  'projectList.new': { zh: '新建项目', en: 'New Project' },
  'projectList.empty': { zh: '暂无项目', en: 'No projects yet' },
  'projectList.emptyDesc': { zh: '开始一个新的需求分析，系统会自动创建项目并保存全部过程数据', en: 'Start a new need analysis and the system will automatically create and save a project.' },
  'projectList.completed': { zh: '已完成', en: 'Completed' },
  'projectList.deleteTitle': { zh: '确认删除项目？', en: 'Delete this project?' },
  'projectList.deleteDesc': { zh: '删除后项目数据将无法恢复。此操作不可撤销。', en: 'The project data will be permanently deleted. This cannot be undone.' },
  'projectList.cancel': { zh: '取消', en: 'Cancel' },
  'projectList.confirmDelete': { zh: '确认删除', en: 'Delete' },
  'projectList.justNow': { zh: '刚刚', en: 'just now' },

  // === Markdown ===
  'markdown.waiting': { zh: '等待生成内容...', en: 'Waiting for content...' },

  // === 需求感知补充 ===
  'sensing.mode': { zh: '模式', en: 'Mode' },
  'sensing.basicMode': { zh: '基础版', en: 'Basic' },

  // === 页面提示 ===
  'page.projectLoaded': { zh: '项目已加载', en: 'Project loaded' },
  'page.unsavedConfirm': { zh: '当前有未保存的工作，确定要新建项目吗？', en: 'You have unsaved work. Are you sure you want to start a new project?' },

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
