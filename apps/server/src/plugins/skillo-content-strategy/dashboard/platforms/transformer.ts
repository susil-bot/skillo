import type { ContentCard, Platform } from '../types';

export interface PlatformCount {
    platform: Platform;
    count: number;
    isPrimary: boolean;
}

/**
 * Builds list of platforms with counts and primary flag for the platform filter UI.
 */
export function getPlatformCounts(
    cards: ContentCard[],
    primaryPlatforms: Platform[] = []
): PlatformCount[] {
    const byPlatform = new Map<Platform, number>();
    for (const card of cards) {
        byPlatform.set(card.platform, (byPlatform.get(card.platform) ?? 0) + 1);
    }
    const platforms: Platform[] = [
        'instagram',
        'youtube',
        'linkedin',
        'blog',
        'x',
        'tiktok',
        'newsletter',
        'podcast',
        'other',
    ];
    return platforms.map((platform) => ({
        platform,
        count: byPlatform.get(platform) ?? 0,
        isPrimary: primaryPlatforms.includes(platform),
    }));
}

/**
 * Filters cards by selected platform ('all' returns all cards).
 */
export function filterCardsByPlatform(cards: ContentCard[], selected: Platform | 'all'): ContentCard[] {
    if (selected === 'all') return cards;
    return cards.filter((c) => c.platform === selected);
}
