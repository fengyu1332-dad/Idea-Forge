// 专家类型
export type ExpertType = 
  | 'product-architect'    // 产品策划专家
  | 'market-analyst'       // 市场预测专家
  | 'tech-lead'            // 技术实现专家
  | 'ux-ui-director'       // 产品设计专家
  | 'growth-hacker';       // 产品营销专家

// 专家信息
export interface Expert {
  id: ExpertType;
  name: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

// 工作流阶段
export type WorkflowStage = 
  | 'need-sensing'      // 需求感知（新增）
  | 'input'             // 灵感输入
  | 'initial-idea'      // 初步构想
  | 'expert-review'     // 专业考验
  | 'synthesis';        // 终极熔铸

// 创新方向
export interface InnovationDirection {
  id: string;
  method: string;           // 创新方法论名称
  title: string;            // 方向标题
  description: string;      // 方向描述
  feasibility: 'high' | 'medium' | 'low';  // 可行性评估
}

// 已有产品/服务
export interface ExistingProduct {
  name: string;
  description: string;
  limitations: string[];    // 局限性
  strengths: string[];      // 优势
}

// 需求感知结果
export interface NeedSensingResult {
  userNeed: string;                           // 用户需求描述
  existingProducts: ExistingProduct[];        // 已有产品/服务
  gapAnalysis: string;                        // 需求缺口分析
  innovationDirections: InnovationDirection[]; // 创新方向
}

// 单条意见
export interface AdviceItem {
  id: string;           // 唯一标识
  content: string;      // 意见内容
  checked: boolean;     // 用户是否勾选认可
  expertType: ExpertType; // 归属哪位专家
  priority?: 'high' | 'medium' | 'low';  // 优先级
}

// 专家报告 - 扁平意见列表
export interface ExpertReport {
  expertId: ExpertType;
  opinions: AdviceItem[];        // 该专家的所有意见
  rawContent: string;            // AI原始输出
  isLoading?: boolean;           // 并行加载时的状态
}

// 产品方案
export interface ProductProposal {
  id: string;
  createdAt: string;
  userInput: string;                    // 用户原始输入
  initialIdea?: string;                 // 初步构想
  expertReports: Partial<Record<ExpertType, ExpertReport>>; // 专家报告
  finalDocument?: string;               // 最终综合文档
  currentStage: WorkflowStage;
  currentExpertIndex: number;           // 当前正在处理的专家索引
}

// API请求类型
export interface GenerateInitialIdeaRequest {
  userInput: string;
}

export interface GenerateExpertReportRequest {
  userInput: string;
  initialIdea: string;
  expertType: ExpertType;
  previousReports?: Partial<Record<ExpertType, ExpertReport>>;
}

export interface GenerateSynthesisRequest {
  userInput: string;
  initialIdea: string;
  expertReports: Partial<Record<ExpertType, ExpertReport>>;
}

// ============================================================
// 项目管理类型
// ============================================================

// 完整项目数据（服务器端JSON文件存储）
export interface Project {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  currentStage: WorkflowStage;
  progress: number;
  userInput: string;
  initialIdea: string;
  finalDocument: string;
  expertReports: Partial<Record<ExpertType, ExpertReport>>;
  needSensingData: NeedSensingProjectData | null;
  showAdviceSummary: boolean;
  selectedDirection: string | null;
  isCompleted: boolean;
}

// 需求感知数据子集
export interface NeedSensingProjectData {
  userNeed: string;
  analysisResult: string;
  selectedDirection: string;
  selectedDirectionTitle: string;
  selectedMethodIds: string[];
  customMethodPrompts: Record<string, string>;
  selectedMethodModes: Record<string, string>;
}

// 项目列表摘要（index.json中的轻量条目）
export interface ProjectSummary {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  currentStage: WorkflowStage;
  progress: number;
  isCompleted: boolean;
}

export interface GenerateNeedSensingRequest {
  userNeed: string;
}

// API响应类型
export interface StreamResponse {
  content: string;
  done: boolean;
}
