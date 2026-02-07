import type { ContentCard } from '../types';
import { cspStorage } from '../lib/storage';

const STORAGE_PREFIX = 'skillo-content-planner';

/**
 * Fetches content cards from storage (or API in future).
 */
export function getContentCards(): ContentCard[] {
    return cspStorage.getContentCards(STORAGE_PREFIX);
}

/**
 * Persists content cards after add/update/remove.
 */
export function setContentCards(cards: ContentCard[]): void {
    cspStorage.setContentCards(cards, STORAGE_PREFIX);
}
