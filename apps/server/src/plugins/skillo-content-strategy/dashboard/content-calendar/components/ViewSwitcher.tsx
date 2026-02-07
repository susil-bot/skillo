import { Button } from '@vendure/dashboard';
import { LayoutGrid, Calendar, Pin, CalendarDays } from 'lucide-react';
import { useCalendar } from '../context/calendar-context';
import type { CalendarViewMode, CalendarFilter } from '../types';

export function ViewSwitcher() {
    const { viewMode, setViewMode, filter, setFilter } = useCalendar();

    return (
        <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4 mb-4">
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
                <Button
                    variant={filter === 'all' ? 'default' : 'ghost'}
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setFilter('all')}
                >
                    <LayoutGrid className="h-4 w-4" />
                    All Content
                </Button>
                <Button
                    variant={filter === 'upcoming' ? 'default' : 'ghost'}
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setFilter('upcoming')}
                >
                    <CalendarDays className="h-4 w-4" />
                    Upcoming Posts
                </Button>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
                <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setViewMode('table')}
                >
                    <LayoutGrid className="h-4 w-4" />
                    Table
                </Button>
                <Button
                    variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setViewMode('kanban')}
                >
                    <Pin className="h-4 w-4" />
                    Kanban View
                </Button>
                <Button
                    variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setViewMode('calendar')}
                >
                    <Calendar className="h-4 w-4" />
                    Calendar View
                </Button>
            </div>
        </div>
    );
}
