import type { BrandProfile, ContentCard } from '../types';

export function buildContentPrompt(
  brand: BrandProfile,
  card: Pick<ContentCard, 'title' | 'platform' | 'contentType' | 'goal' | 'relatedPillar'>
): string {
  const tone = brand.brandTone;
  const audience = brand.targetAudience;
  const goal = card.goal ?? brand.contentGoals[0] ?? 'engagement';
  const pillar = card.relatedPillar ?? brand.contentPillars[0] ?? 'content';
  const platform = card.platform;
  const type = card.contentType;
  return [
    `Write this ${type} in a ${tone} tone for ${audience}.`,
    `Goal: ${goal}. Content pillar: ${pillar}.`,
    `Platform: ${platform}.`,
    `Title/theme: ${card.title}.`,
  ].join(' ');
}
