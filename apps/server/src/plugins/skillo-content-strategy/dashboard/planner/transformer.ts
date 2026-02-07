import type { ContentCard, ContentGoal, Platform } from '../types';

/**
 * Default card shape for "new" content idea (before id/createdAt/updatedAt).
 */
export interface DefaultCardInput {
    title: string;
    platform: Platform;
    contentType: ContentCard['contentType'];
    status: ContentCard['status'];
    relatedPillar?: string;
    goal?: ContentGoal;
}

/**
 * Builds default card values for the planner form (e.g. first pillar, first goal).
 */
export function getDefaultCardInput(profile: {
    contentPillars?: string[];
    contentGoals?: ContentGoal[];
} | null): DefaultCardInput {
    return {
        title: '',
        platform: 'instagram',
        contentType: 'post',
        status: 'idea',
        relatedPillar: profile?.contentPillars?.[0],
        goal: profile?.contentGoals?.[0],
    };
}

/**
 * Sorts cards by updatedAt descending for display.
 */
export function sortCardsByUpdated(cards: ContentCard[]): ContentCard[] {
    return [...cards].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}
