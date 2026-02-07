import type { ContentCard } from '../types';
import { cspStorage } from '../lib/storage';

const STORAGE_PREFIX = 'skillo-content-planner';

/**
 * Fetches content cards for visualization (relationship view).
 */
export function getContentCardsForVisualization(): ContentCard[] {
    return cspStorage.getContentCards(STORAGE_PREFIX);
}
