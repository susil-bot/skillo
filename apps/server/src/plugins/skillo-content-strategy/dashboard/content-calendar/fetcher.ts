/**
 * Content Calendar API fetcher (for future backend integration).
 * Replace mock/context state with calls to CSP or dedicated calendar API.
 */

import type { ContentCalendarItem } from './types';

const STORAGE_KEY = 'skillo-content-calendar';

export function getCalendarItemsFromStorage(): ContentCalendarItem[] {
    try {
        const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function setCalendarItemsInStorage(items: ContentCalendarItem[]): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
