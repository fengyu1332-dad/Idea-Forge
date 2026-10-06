export const METHOD_REFERENCES = [
  {
    id: 'TRIZ-EC', title: 'MATRIZ · Engineering contradiction',
    url: 'https://wiki.matriz.org/docs/triz/problem-solving-tools-5890/contradictions/engineering-contradiction-5995/',
    note: '技术矛盾描述：采用某项改变改善一个参数，却使另一个参数恶化。用 IF–THEN–BUT 表达，并说明参数映射的依据。',
  },
  {
    id: 'TRIZ-ARIZ', title: 'MATRIZ · ARIZ',
    url: 'https://wiki.matriz.org/docs/triz/problem-solving-tools-5890/ariz-5892/',
    note: 'ARIZ-85C 是包含九部分的系统过程。IFR 针对具体问题寻求最少改变且不恶化系统参数的结果，不能等同于零成本、零能耗的理想系统。',
  },
  {
    id: 'TRIZ-SF', title: 'MATRIZ · Substance-field model',
    url: 'https://wiki.matriz.org/docs/triz/problem-solving-tools-5890/substance-field-modeling/standard-inventive-solutions/substance-field-model/',
    note: '物场模型用于表述与问题相关的物质及物理相互作用。对抽象商业需求，不得把动机、信任等直接当作物理场。',
  },
] as const;

export const EVIDENCE_RULES = `
## 证据与能力边界（适用于所有阶段，优先于方法模板的扩展要求）
- 本服务只进行语言模型分析，未调用联网搜索、专利数据库、矛盾矩阵查询或仿真工具。不得声称已经检索、查表、实测、认证或证明可行。附带的方法资料只支持方法定义，不证明本项目的技术或商业结论。
- 将关键断言标为【用户提供，未核验】、【有来源资料】、【推断】、【待验证假设】或【未知／待补充】。只有实际提供的资料才能列为有来源资料，标出对应材料及适用范围；不得编造出处、链接、市场规模、竞品特性、专利新颖性、实验数据或标准编号。
- 用户输入里的数据可作为暂定基线，保留单位、工况和来源属性；前序 AI 文本及多角色意见都属于待核验材料，重复出现或多角色一致不构成独立证据。
- 信息不足时，明确关键缺口与最小补测／访谈清单，允许结论为“暂不能判断”。不要为凑齐模板而捏造技术矛盾、量化评分或候选方案。
- 所有自拟目标、验收阈值、样本量、成本和时间都标为“建议值，待确认”，交代理由与依赖。未给基线时写“待测”；未给验收限值时写“待负责人确认”，不得写“已达标”。测量不确定度、适用工况、风险和反证需一并考虑。
- 把建议转换为可证伪的假设：测试什么、怎样测、与什么比较、何种结果支持／否定它、下一步如何决策。建议中的技术措施不得越过用户的硬约束。
- 用户的采纳偏好与事实判断分开；未采纳的建议不强行纳入方案，但涉及安全、基本可行性、硬约束或证据缺口的风险，仍在“未解决风险”中保留并给出关闭条件。
`;

export function outputLanguage(language?: string): string {
  return language === 'en'
    ? 'Write the entire user-facing response in English, including evidence labels. Preserve fixed machine-readable tags and JSON keys exactly.'
    : '全部面向用户的内容用中文；机器读取的固定标签和 JSON 字段名保持不变。';
}

export const METHOD_REFERENCE_PROMPT = `方法定义参考（MATRIZ 知识库；不是本项目证据）：\n${METHOD_REFERENCES.map(r => `[${r.id}] ${r.note}\n来源：${r.url}`).join('\n')}`;

export const TRIZ_BASE_PROMPT = `使用 TRIZ 辅助提出可验证的改进假设，而非保证创新成功。
1. 定义系统边界、功能、问题现象、工况和硬约束；将根因假说与已观测现象分开。
2. 仅在有可解释的参数冲突时，用 IF–THEN–BUT 表述技术矛盾。物理矛盾须是同一对象的同一属性在明确条件下需取相反状态；没有依据时说明暂不能建立。
3. 列举可用资源、期望结果和候选改变；说明改变如何同时改善目标参数、避免恶化另一参数。可以提出原理启发，但必须标注“启发式建议，未查矩阵”，不得声称是矩阵推荐，不得猜测矩阵单元格、原理编号或标准解编号。
4. 每个候选方案列出机理假说、适用条件、可能副作用和最小验证步骤。仅当问题确有物理相互作用时使用物场分析；商业和服务类比必须明确为类比，不强套物理模型。
5. IFR 是分析目标，不是可实现性证明；不得许诺零资源或违反物理约束。没有时间序列和技术证据时不判断 S 曲线阶段，也不输出无依据的理想度分数。
${METHOD_REFERENCE_PROMPT}`;

export const TRIZ_EXTENDED_PROMPT = `${TRIZ_BASE_PROMPT}
补充分析（按适用性选择，并说明不适用的原因）：功能关系与有害／不足作用；根因假说及反证；作用区、作用时间及现有资源；时间／空间／条件等分离思路；方案之间的约束冲突。
这是一份 TRIZ 辅助分析，不是完整 ARIZ-85C 执行。未接入76标准解全文及科学效应库，不引用未经核验的条目编号。涉及科学效应时解释适用条件与验证需求，不把比喻当作物理机制。复杂且信息不足的问题可以停在“需要补充的资料与测试”，不可强制走完所有工具。`;
