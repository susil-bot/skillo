import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import type { ContentCalendarItem, CalendarViewMode, CalendarFilter } from '../types';
import { MOCK_CALENDAR_ITEMS } from '../mock-data';
import { CALENDAR_STATUS_ORDER } from '../constants';

interface CalendarContextValue {
    items: ContentCalendarItem[];
    viewMode: CalendarViewMode;
    filter: CalendarFilter;
    selectedItemId: string | null;
    setViewMode: (mode: CalendarViewMode) => void;
    setFilter: (filter: CalendarFilter) => void;
    addItem: (item: Omit<ContentCalendarItem, 'id' | 'createdAt' | 'updatedAt'>) => ContentCalendarItem;
    updateItem: (id: string, updates: Partial<ContentCalendarItem>) => void;
    updateItemStatus: (id: string, status: ContentCalendarItem['status']) => void;
    updateItemDate: (id: string, date: string) => void;
    deleteItem: (id: string) => void;
    setSelectedItemId: (id: string | null) => void;
    getItemById: (id: string) => ContentCalendarItem | undefined;
    getFilteredItems: () => ContentCalendarItem[];
}

const CalendarContext = createContext<CalendarContextValue | null>(null);

function generateId(): string {
    return crypto.randomUUID();
}

export function CalendarProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<ContentCalendarItem[]>(() => MOCK_CALENDAR_ITEMS);
    const [viewMode, setViewMode] = useState<CalendarViewMode>('table');
    const [filter, setFilter] = useState<CalendarFilter>('all');
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    const getItemById = useCallback(
        (id: string) => items.find((i) => i.id === id),
        [items]
    );

    const addItem = useCallback(
        (item: Omit<ContentCalendarItem, 'id' | 'createdAt' | 'updatedAt'>): ContentCalendarItem => {
            const now = new Date().toISOString();
            const newItem: ContentCalendarItem = {
                ...item,
                id: `cc-${generateId()}`,
                createdAt: now,
                updatedAt: now,
            };
            setItems((prev) => [...prev, newItem]);
            return newItem;
        },
        []
    );

    const updateItem = useCallback((id: string, updates: Partial<ContentCalendarItem>) => {
        setItems((prev) =>
            prev.map((i) =>
                i.id === id
                    ? { ...i, ...updates, updatedAt: new Date().toISOString() }
                    : i
            )
        );
    }, []);

    const updateItemStatus = useCallback((id: string, status: ContentCalendarItem['status']) => {
        updateItem(id, { status });
    }, [updateItem]);

    const updateItemDate = useCallback((id: string, date: string) => {
        updateItem(id, { date });
    }, [updateItem]);

    const deleteItem = useCallback((id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
        if (selectedItemId === id) setSelectedItemId(null);
    }, [selectedItemId]);

    const getFilteredItems = useCallback((): ContentCalendarItem[] => {
        const list = [...items].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        if (filter === 'upcoming') {
            const today = new Date().toISOString().slice(0, 10);
            return list.filter((i) => i.date >= today);
        }
        return list;
    }, [items, filter]);

    const value = useMemo<CalendarContextValue>(
        () => ({
            items,
            viewMode,
            filter,
            selectedItemId,
            setViewMode,
            setFilter,
            addItem,
            updateItem,
            updateItemStatus,
            updateItemDate,
            deleteItem,
            setSelectedItemId,
            getItemById,
            getFilteredItems,
        }),
        [
            items,
            viewMode,
            filter,
            selectedItemId,
            addItem,
            updateItem,
            updateItemStatus,
            updateItemDate,
            deleteItem,
            getItemById,
            getFilteredItems,
        ]
    );

    return (
        <CalendarContext.Provider value={value}>
            {children}
        </CalendarContext.Provider>
    );
}

export function useCalendar() {
    const ctx = useContext(CalendarContext);
    if (!ctx) throw new Error('useCalendar must be used within CalendarProvider');
    return ctx;
}

export function groupItemsByStatus(items: ContentCalendarItem[]) {
    const groups: Record<string, ContentCalendarItem[]> = {};
    for (const status of CALENDAR_STATUS_ORDER) {
        groups[status] = items.filter((i) => i.status === status);
    }
    return groups;
}
