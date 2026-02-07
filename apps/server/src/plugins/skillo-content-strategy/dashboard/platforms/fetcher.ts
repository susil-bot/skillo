import type { BrandProfile, ContentCard } from '../types';
import { cspStorage } from '../lib/storage';

const STORAGE_PREFIX = 'skillo-content-planner';

/**
 * Fetches content cards for platform view.
 */
export function getContentCards(): ContentCard[] {
    return cspStorage.getContentCards(STORAGE_PREFIX);
}

/**
 * Fetches brand profile (for primary platforms).
 */
export function getBrandProfile(): BrandProfile | null {
    return cspStorage.getBrandProfile(STORAGE_PREFIX);
}
