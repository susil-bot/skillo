import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCalendar } from '../context/calendar-context';
import type { ContentCalendarItem } from '../types';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function isoDate(y: number, m: number, d: number) {
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function CalendarView({ onEdit }: { onEdit: (item: ContentCalendarItem) => void }) {
    const { getFilteredItems } = useCalendar();
    const [viewDate, setViewDate] = useState(() => new Date());
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const items = getFilteredItems();
    const itemsByDate: Record<string, ContentCalendarItem[]> = {};
    for (const item of items) {
        const d = item.date;
        if (!itemsByDate[d]) itemsByDate[d] = [];
        itemsByDate[d].push(item);
    }

    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startPad = first.getDay();
    const totalDays = last.getDate();
    const cells: { dateStr: string | null; items: ContentCalendarItem[] }[] = [];

    for (let i = 0; i < startPad; i++) cells.push({ dateStr: null, items: [] });
    for (let d = 1; d <= totalDays; d++) {
        const dateStr = isoDate(year, month + 1, d);
        cells.push({ dateStr, items: itemsByDate[dateStr] ?? [] });
    }
    const totalCells = 7 * Math.ceil((startPad + totalDays) / 7);
    while (cells.length < totalCells) cells.push({ dateStr: null, items: [] });

    const prevMonth = () => setViewDate(new Date(year, month - 1));
    const nextMonth = () => setViewDate(new Date(year, month + 1));

    const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={prevMonth}
                        className="p-2 rounded-md hover:bg-muted"
                        aria-label="Previous month"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="font-semibold min-w-[180px] text-center">
                        {monthLabel}
                    </span>
                    <button
                        type="button"
                        onClick={nextMonth}
                        className="p-2 rounded-md hover:bg-muted"
                        aria-label="Next month"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>
            <div className="p-4">
                <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden border border-border">
                    {DAY_NAMES.map((day) => (
                        <div
                            key={day}
                            className="bg-muted/30 py-2 text-center text-xs font-medium text-muted-foreground"
                        >
                            {day}
                        </div>
                    ))}
                    {cells.map((cell, i) => (
                        <div
                            key={i}
                            className="bg-card min-h-[100px] p-1.5 flex flex-col"
                        >
                            {cell.dateStr && (
                                <>
                                    <span className="text-xs font-medium text-muted-foreground mb-1">
                                        {new Date(cell.dateStr + 'T12:00:00').getDate()}
                                    </span>
                                    <div className="space-y-1 flex-1 overflow-auto">
                                        {cell.items.slice(0, 3).map((item) => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => onEdit(item)}
                                                className="w-full text-left rounded border border-border bg-primary/10 hover:bg-primary/20 px-2 py-1 text-xs font-medium truncate block"
                                            >
                                                {item.title}
                                            </button>
                                        ))}
                                        {cell.items.length > 3 && (
                                            <span className="text-[10px] text-muted-foreground">
                                                +{cell.items.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
