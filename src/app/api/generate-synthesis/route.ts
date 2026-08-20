import { NextRequest } from 'next/server';
import { streamDeepSeek } from '@/lib/deepseek';
import { SYNTHESIS_PROMPT } from '@/config/synthesis';
import { ExpertReport, AdviceItem } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EXPERT_NAMES: Record<string, string> = {
  'product-architect': '产品策划专家',
  'market-analyst': '市场预测专家',
  'tech-lead': '技术实现专家',
  'ux-ui-director': '产品视觉设计专家',
  'growth-hacker': '产品营销专家',
};

export async function POST(request: NextRequest) {
  try {
    const { userInput, initialIdea, expertReports, needSensingData } = await request.json();

    if (!userInput || !initialIdea) {
      return new Response(JSON.stringify({ error: '参数不完整' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 构建用户认可的专家意见清单（结构化，便于AI逐条回应）
    let expertOpinionsSection = '';

    if (expertReports && Object.keys(expertReports).length > 0) {
      const allOpinions: string[] = [];
      let opinionIndex = 0;

      for (const [expertId, report] of Object.entries(expertReports)) {
        if (!report) continue;

        const expertReport = report as ExpertReport;
        const expertName = EXPERT_NAMES[expertId] || expertId;
        const expertOpinions: string[] = [];

        // 遍历该专家的所有已勾选意见
        const checkedOpinions = (expertReport.opinions || []).filter((item: AdviceItem) => item.checked);
        for (const item of checkedOpinions) {
          opinionIndex++;
          const priorityLabel = item.priority === 'high' ? '⭐高优先级' :
                                item.priority === 'low' ? '○低优先级' : '·中优先级';
          expertOpinions.push(`  - [意见#${opinionIndex}] ${priorityLabel} ${item.content}`);
          allOpinions.push(`意见#${opinionIndex}（${expertName}）：${item.content}`);
        }

        if (expertOpinions.length > 0) {
          expertOpinionsSection += `\n### ${expertName}\n${expertOpinions.join('\n')}\n`;
        }
      }

      if (allOpinions.length > 0) {
        expertOpinionsSection = `以下是用户认可的专家意见（共${allOpinions.length}条）。每条意见都带有编号，你必须在最终报告的对应章节中逐条回应这些意见。

**优先级说明**：
- ⭐高优先级：必须在方案核心处重点体现
- ·中优先级：正常采纳
- ○低优先级：酌情采纳，冲突时让步于高优先级

**回应要求**：
- 每条意见必须在方案中明确回应（已采纳/部分采纳/否决）
- 被采纳的意见必须落地为具体的产品设计或策略描述
- 每个主要章节末尾用引用格式标注回应了哪些意见编号

${expertOpinionsSection}
**检查清单**：最终报告生成后，你必须自查以下${allOpinions.length}条意见是否全部得到回应：
${allOpinions.map((op, i) => `${i + 1}. ${op}`).join('\n')}
如果有任何一条未在报告中得到回应，必须补充。`;
      }
    } else {
      expertOpinionsSection = '\n（用户未确认任何专家意见，基于原始想法和初步构想生成方案）\n';
    }

    // 构建需求感知上下文
    let needSensingSection = '';
    if (needSensingData) {
      needSensingSection = '\n## 需求感知结果\n';
      if (needSensingData.userNeed) {
        needSensingSection += `用户需求：${needSensingData.userNeed}\n`;
      }
      if (needSensingData.selectedDirectionTitle) {
        needSensingSection += `选择的创新方向：${needSensingData.selectedDirectionTitle}\n`;
      }
      if (needSensingData.selectedDirection) {
        needSensingSection += `方向详情：${needSensingData.selectedDirection}\n`;
      }
    }

    const messages = [
      { role: 'system' as const, content: SYNTHESIS_PROMPT },
      {
        role: 'user' as const,
        content: `请基于以下材料，生成《产品综合商业计划与需求文档》。

## 用户原始想法
${userInput}
${needSensingSection}
## 初步构想
${initialIdea}

## 用户认可的专家意见
${expertOpinionsSection}

请确保：
1. 每条专家意见都在方案中被明确回应（采纳/部分采纳/否决）
2. 高优先级意见在方案核心处重点体现
3. 每个主要章节末尾标注回应了哪些专家意见`,
      },
    ];

    const stream = streamDeepSeek(messages, { temperature: 0.7, maxTokens: 16384 });

    const encoder = new TextEncoder();
    let streamClosed = false;

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (streamClosed) break;
            if (chunk.content) {
              const text = chunk.content.toString();
              const data = JSON.stringify({ content: text, done: false });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }

          if (!streamClosed) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: '', done: true })}\n\n`));
            controller.close();
          }
        } catch (error) {
          console.error('Stream error:', error);
          if (!streamClosed) {
            streamClosed = true;
            try {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: '', done: true, error: true })}\n\n`));
              controller.close();
            } catch {
              // controller already closed
            }
          }
        }
      },
      cancel() {
        streamClosed = true;
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: '生成失败，请重试' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
