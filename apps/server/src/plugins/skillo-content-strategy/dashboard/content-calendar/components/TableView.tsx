import { Button, Badge } from '@vendure/dashboard';
import { Pencil, Calendar, Globe, Circle, FileImage, Tag, Link2, Plus } from 'lucide-react';
import { useCalendar } from '../context/calendar-context';
import { CALENDAR_STATUS_OPTIONS, CALENDAR_CONTENT_TYPE_OPTIONS, PLATFORM_OPTIONS_CALENDAR } from '../constants';
import type { ContentCalendarItem } from '../types';

const STATUS_COLORS: Record<string, string> = {
    drafting: 'bg-amber-100 text-amber-800 border-amber-200',
    editing: 'bg-orange-100 text-orange-800 border-orange-200',
    scheduled: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    published: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

const TYPE_COLORS: Record<string, string> = {
    video: 'bg-green-100 text-green-800 border-green-200',
    article: 'bg-blue-100 text-blue-800 border-blue-200',
    thread: 'bg-slate-100 text-slate-800 border-slate-200',
    infographic: 'bg-violet-100 text-violet-800 border-violet-200',
    'long-form': 'bg-amber-100 text-amber-800 border-amber-200',
    reel: 'bg-pink-100 text-pink-800 border-pink-200',
    post: 'bg-sky-100 text-sky-800 border-sky-200',
    short: 'bg-rose-100 text-rose-800 border-rose-200',
    other: 'bg-gray-100 text-gray-800 border-gray-200',
};

const PLATFORM_COLORS: Record<string, string> = {
    instagram: 'bg-blue-50 text-blue-700 border-blue-200',
    youtube: 'bg-red-50 text-red-700 border-red-200',
    linkedin: 'bg-blue-100 text-blue-800 border-blue-200',
    blog: 'bg-pink-50 text-pink-700 border-pink-200',
    x: 'bg-slate-100 text-slate-800 border-slate-200',
    tiktok: 'bg-slate-800 text-white border-slate-600',
    pinterest: 'bg-red-100 text-red-800 border-red-200',
    newsletter: 'bg-amber-50 text-amber-800 border-amber-200',
    other: 'bg-gray-100 text-gray-700 border-gray-200',
};

function formatDate(iso: string) {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function getLabel(value: string, options: { value: string; label: string }[]) {
    return options.find((o) => o.value === value)?.label ?? value;
}

export function TableView({
    onAdd,
    onEdit,
}: {
    onAdd: () => void;
    onEdit: (item: ContentCalendarItem) => void;
}) {
    const { getFilteredItems } = useCalendar();
    const items = getFilteredItems();

    return (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Pencil className="h-4 w-4" />
                    Content Calendar
                </div>
                <Button size="sm" className="gap-1.5" onClick={onAdd}>
                    <Plus className="h-4 w-4" />
                    New
                </Button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted/30">
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground w-[min(220px,25%)]">
                                <span className="flex items-center gap-2">
                                    <span className="text-base">Aa</span> Content Title
                                </span>
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground w-[140px]">
                                <span className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> Date
                                </span>
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                                <span className="flex items-center gap-2">
                                    <Globe className="h-4 w-4" /> Platform
                                </span>
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                                <span className="flex items-center gap-2">
                                    <Circle className="h-4 w-4" /> Status
                                </span>
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                                <span className="flex items-center gap-2">
                                    <FileImage className="h-4 w-4" /> Content Type
                                </span>
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                                <span className="flex items-center gap-2">
                                    <Tag className="h-4 w-4" /> Brand
                                </span>
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                                <span className="flex items-center gap-2">
                                    <Link2 className="h-4 w-4" /> Linked
                                </span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-12 text-center text-muted-foreground">
                                    No content yet. Click New to add an entry.
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-b border-border hover:bg-muted/20 transition-colors"
                                >
                                    <td className="py-3 px-4">
                                        <button
                                            type="button"
                                            className="text-left font-medium text-foreground hover:underline focus:outline-none"
                                            onClick={() => onEdit(item)}
                                        >
                                            {item.title}
                                        </button>
                                    </td>
                                    <td className="py-3 px-4 text-muted-foreground">
                                        {formatDate(item.date)}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex flex-wrap gap-1">
                                            {item.platforms.map((p) => (
                                                <span
                                                    key={p}
                                                    className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${PLATFORM_COLORS[p] ?? PLATFORM_COLORS.other}`}
                                                >
                                                    {getLabel(p, PLATFORM_OPTIONS_CALENDAR)}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span
                                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[item.status] ?? ''}`}
                                        >
                                            {getLabel(item.status, CALENDAR_STATUS_OPTIONS)}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span
                                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[item.contentType] ?? TYPE_COLORS.other}`}
                                        >
                                            {getLabel(item.contentType, CALENDAR_CONTENT_TYPE_OPTIONS)}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        {item.brandTag ? (
                                            <span className="rounded-md border border-border bg-muted/30 px-2 py-0.5 text-xs">
                                                {item.brandTag}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        {item.linkedContentIds.length > 0 ? (
                                            <span className="text-muted-foreground text-xs">
                                                {item.linkedContentIds.length} linked
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
