import type { BrandProfile, ContentCard } from '../types';

const DEFAULT_PREFIX = 'skillo-content-planner';

function key(prefix: string, name: string): string {
  return `${prefix}:${name}`;
}

export const cspStorage = {
  getBrandProfile(prefix = DEFAULT_PREFIX): BrandProfile | null {
    try {
      const raw = localStorage.getItem(key(prefix, 'brandProfile'));
      if (!raw) return null;
      return JSON.parse(raw) as BrandProfile;
    } catch {
      return null;
    }
  },

  setBrandProfile(profile: BrandProfile, prefix = DEFAULT_PREFIX): void {
    const withMeta = { ...profile, updatedAt: new Date().toISOString() };
    localStorage.setItem(key(prefix, 'brandProfile'), JSON.stringify(withMeta, null, 2));
  },

  getContentCards(prefix = DEFAULT_PREFIX): ContentCard[] {
    try {
      const raw = localStorage.getItem(key(prefix, 'contentCards'));
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  setContentCards(cards: ContentCard[], prefix = DEFAULT_PREFIX): void {
    localStorage.setItem(key(prefix, 'contentCards'), JSON.stringify(cards, null, 2));
  },
};
