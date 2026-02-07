import type { BrandProfile } from '../types';
import { cspStorage } from '../lib/storage';

const STORAGE_PREFIX = 'skillo-content-planner';

/**
 * Fetches brand profile from storage (or API in future).
 * Handles query/response for Brand feature.
 */
export function getBrandProfile(): BrandProfile | null {
    return cspStorage.getBrandProfile(STORAGE_PREFIX);
}

/**
 * Persists brand profile. Use after validation/transformation.
 */
export function saveBrandProfile(profile: BrandProfile): void {
    const withMeta = { ...profile, updatedAt: new Date().toISOString() };
    cspStorage.setBrandProfile(withMeta, STORAGE_PREFIX);
}
