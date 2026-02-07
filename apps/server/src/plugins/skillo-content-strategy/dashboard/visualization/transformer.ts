import type { ContentCard, RelationshipGroupBy } from '../types';

export interface GroupedEntry {
    key: string;
    cards: ContentCard[];
}

const LABELS: Record<RelationshipGroupBy, string> = {
    pillar: 'Pillar',
    goal: 'Goal',
    campaign: 'Campaign',
    platform: 'Platform',
};

/**
 * Transforms flat content cards into groups by pillar, goal, campaign, or platform.
 * Returns sorted entries for display.
 */
export function groupCardsBy(
    cards: ContentCard[],
    groupBy: RelationshipGroupBy
): GroupedEntry[] {
    const grouped = new Map<string, ContentCard[]>();
    for (const card of cards) {
        const key =
            groupBy === 'pillar'
                ? card.relatedPillar ?? 'Unassigned'
                : groupBy === 'goal'
                  ? card.goal ?? 'Unassigned'
                  : groupBy === 'campaign'
                    ? card.campaign ?? 'Unassigned'
                    : card.platform;
        const list = grouped.get(key) ?? [];
        list.push(card);
        grouped.set(key, list);
    }
    return Array.from(grouped.entries())
        .map(([key, cards]) => ({ key, cards }))
        .sort((a, b) => a.key.localeCompare(b.key));
}

export function getGroupByLabel(groupBy: RelationshipGroupBy): string {
    return LABELS[groupBy];
}
