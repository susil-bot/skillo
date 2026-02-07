import { useState } from 'react';
import { Badge } from '@vendure/dashboard';
import { useCalendar } from '../context/calendar-context';
import { groupItemsByStatus } from '../context/calendar-context';
import { CALENDAR_STATUS_OPTIONS, PLATFORM_OPTIONS_CALENDAR } from '../constants';
import type { ContentCalendarItem } from '../types';

function formatDate(iso: string) {
    return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

function getLabel(value: string, options: { value: string; label: string }[]) {
    return options.find((o) => o.value === value)?.label ?? value;
}

export function KanbanView({ onEdit }: { onEdit: (item: ContentCalendarItem) => void }) {
    const { getFilteredItems, updateItemStatus } = useCalendar();
    const items = getFilteredItems();
    const groups = groupItemsByStatus(items);
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent, item: ContentCalendarItem) => {
        setDraggedId(item.id);
        e.dataTransfer.setData('text/plain', item.id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, status: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverStatus(status);
    };

    const handleDragLeave = () => {
        setDragOverStatus(null);
    };

    const handleDrop = (e: React.DragEvent, status: string) => {
        e.preventDefault();
        setDragOverStatus(null);
        setDraggedId(null);
        const id = e.dataTransfer.getData('text/plain');
        if (id) updateItemStatus(id, status as ContentCalendarItem['status']);
    };

    const handleDragEnd = () => {
        setDraggedId(null);
        setDragOverStatus(null);
    };

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[400px]">
            {CALENDAR_STATUS_OPTIONS.map(({ value: status, label }) => {
                const columnItems = groups[status] ?? [];
                const isOver = dragOverStatus === status;
                return (
                    <div
                        key={status}
                        className={`flex-shrink-0 w-[280px] rounded-lg border-2 ${isOver ? 'border-primary bg-primary/5' : 'border-border'} bg-muted/20 transition-colors`}
                        onDragOver={(e) => handleDragOver(e, status)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, status)}
                    >
                        <div className="px-3 py-2 border-b border-border flex items-center justify-between">
                            <span className="font-medium text-sm">{label}</span>
                            <Badge variant="secondary" className="text-xs">
                                {columnItems.length}
                            </Badge>
                        </div>
                        <div className="p-2 space-y-2 min-h-[120px]">
                            {columnItems.map((item) => (
                                <div
                                    key={item.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, item)}
                                    onDragEnd={handleDragEnd}
                                    className={`rounded-lg border border-border bg-card p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
                                        draggedId === item.id ? 'opacity-50' : ''
                                    }`}
                                    onClick={() => onEdit(item)}
                                >
                                    <p className="font-medium text-sm line-clamp-2 mb-1.5">
                                        {item.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground mb-2">
                                        {formatDate(item.date)}
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                        {item.platforms.slice(0, 3).map((p) => (
                                            <span
                                                key={p}
                                                className="rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10px]"
                                            >
                                                {getLabel(p, PLATFORM_OPTIONS_CALENDAR)}
                                            </span>
                                        ))}
                                        {item.platforms.length > 3 && (
                                            <span className="text-[10px] text-muted-foreground">
                                                +{item.platforms.length - 3}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
