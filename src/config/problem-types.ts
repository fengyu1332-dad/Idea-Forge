import type { ProblemType } from '@/types';
import type { Language } from '@/lib/i18n';

export const PROBLEM_TYPES = ['product', 'engineering'] as const;
export const PROBLEM_PROFILES = {
  product: {
    label: { zh: '产品构思', en: 'Product concept' },
    deliverable: { zh: '产品验证计划', en: 'Product Validation Plan' },
    description: {
      zh: '验证谁需要、是否有用、是否愿意付费；输出假设、最小测试和继续／停止条件。',
      en: 'Test the need, usefulness and willingness to pay, with hypotheses, small tests and go / no-go criteria.',
    },
    placeholder: {
      zh: '描述目标用户、使用场景、当前替代方案和已有证据。例如：自由职业者经常漏记项目工时，我想验证自动记录工具是否值得开发。',
      en: 'Describe the users, situation, alternatives and evidence. Example: freelancers miss billable time; is an automatic time tracker worth building?',
    },
  },
  engineering: {
    label: { zh: '工程改进', en: 'Engineering improvement' },
    deliverable: { zh: '工程试验方案与验收指标', en: 'Engineering Test Plan & Acceptance Criteria' },
    description: {
      zh: '明确系统、工况、基线和约束；输出对照试验、测量方法及待确认的验收指标。',
      en: 'Define the system, conditions, baseline and constraints, then design controlled tests and measurable acceptance criteria.',
    },
    placeholder: {
      zh: '描述设备或流程、故障现象、工况、当前测量值、目标和不可突破的约束。没有数据可写“待测”，例如：风机降噪时风量下降，外形尺寸不能增加。',
      en: 'Describe the system, failure, conditions, measured baseline, target and constraints. Mark unknowns as unmeasured. Example: reducing fan noise lowers airflow; dimensions must stay fixed.',
    },
  },
} satisfies Record<ProblemType, {
  label: Record<Language, string>;
  deliverable: Record<Language, string>;
  description: Record<Language, string>;
  placeholder: Record<Language, string>;
}>;

/** Legacy projects were product-only; new API requests validate their mode. */
export function getSavedProblemType(value: unknown): ProblemType {
  return value === 'engineering' ? 'engineering' : 'product';
}

export function problemContext(problemType: ProblemType): string {
  return problemType === 'engineering'
    ? '当前需求类型：工程改进。围绕既有系统的功能、失效、工况、基线、约束、可测量目标工作。最终交付工程试验方案与验收指标，不套用市场规模、用户增长或商业计划模板。'
    : '当前需求类型：产品构思。围绕目标用户、问题证据、替代方案、价值与付费假设工作。最终交付产品验证计划，重点是验证最不确定的假设，不将概念写成已证实的商业机会。';
}
