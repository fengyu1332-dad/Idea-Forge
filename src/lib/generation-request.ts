import { z } from 'zod';
import { PROBLEM_TYPES } from '@/config/problem-types';
import { getExperts } from '@/config/experts';
import type { ExpertType } from '@/types';

const text = z.string().trim().min(1).max(80000);
const context = z.object({
  problemType: z.enum(PROBLEM_TYPES).default('product'),
  language: z.enum(['zh', 'en']).optional(),
});
export const initialRequest = context.extend({ userInput: text });
export const reviewRequest = initialRequest.extend({ initialIdea: text });
export const needRequest = context.extend({
  userNeed: text,
  selectedMethodIds: z.array(z.string()).max(10).default([]),
  customMethodPrompts: z.record(z.string(), z.string().max(30000)).default({}),
  selectedMethodModes: z.record(z.string(), z.string()).default({}),
});
const expertId = z.custom<ExpertType>((value) =>
  [...getExperts('product'), ...getExperts('engineering')].some(e => e.id === value));
export const expertReviewRequest = reviewRequest.extend({
  expertIds: z.array(expertId).min(1).max(5).optional(),
}).refine(data => !data.expertIds || data.expertIds.every(id => getExperts(data.problemType).some(e => e.id === id)));
const report = z.object({
  expertId,
  opinions: z.array(z.object({
    id: z.string(), content: z.string().max(10000), checked: z.boolean(), expertType: expertId,
    priority: z.enum(['high', 'medium', 'low']).optional(),
  })).max(100),
  rawContent: z.string().max(80000),
});
export const synthesisRequest = reviewRequest.extend({
  expertReports: z.record(z.string(), report).default({}),
  needSensingData: z.object({
    userNeed: z.string().max(80000), analysisResult: z.string().max(150000),
    selectedDirection: z.string().max(30000), selectedDirectionTitle: z.string().max(2000),
    selectedMethodIds: z.array(z.string()).max(10),
    customMethodPrompts: z.record(z.string(), z.string().max(30000)),
    selectedMethodModes: z.record(z.string(), z.string()),
  }).partial().nullish(),
}).refine(data => Object.entries(data.expertReports).every(([id, value]) =>
  getExperts(data.problemType).some(e => e.id === id) && value.expertId === id &&
  value.opinions.every(item => item.expertType === id)), {
  message: 'Review perspectives must match the selected problem type.',
});

export function invalidGenerationRequest(): Response {
  return Response.json({ error: 'Invalid generation request. Check the problem type and required text.' }, { status: 400 });
}
