import type { ContentCalendarItem } from './types';
import { CALENDAR_STATUS_ORDER } from './constants';

/**
 * Sort calendar items by date ascending.
 */
export function sortItemsByDate(items: ContentCalendarItem[]): ContentCalendarItem[] {
    return [...items].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
}

/**
 * Filter to upcoming only (date >= today).
 */
export function filterUpcoming(items: ContentCalendarItem[]): ContentCalendarItem[] {
    const today = new Date().toISOString().slice(0, 10);
    return items.filter((i) => i.date >= today);
}

/**
 * Group items by status for Kanban columns.
 */
export function groupByStatus(
    items: ContentCalendarItem[]
): Record<string, ContentCalendarItem[]> {
    const groups: Record<string, ContentCalendarItem[]> = {};
    for (const status of CALENDAR_STATUS_ORDER) {
        groups[status] = items.filter((i) => i.status === status);
    }
    return groups;
}
