import { useState, useEffect } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Textarea } from '@vendure/dashboard';
import { useCalendar } from '../context/calendar-context';
import { Trash2 } from 'lucide-react';
import {
    CALENDAR_STATUS_OPTIONS,
    CALENDAR_CONTENT_TYPE_OPTIONS,
    PLATFORM_OPTIONS_CALENDAR,
} from '../constants';
import type { ContentCalendarItem } from '../types';

const INPUT_CLASS = 'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs';

export function ContentItemForm({
    item,
    onSave,
    onCancel,
}: {
    item: ContentCalendarItem | null;
    onSave: () => void;
    onCancel: () => void;
}) {
    const { addItem, updateItem, deleteItem, getFilteredItems } = useCalendar();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [platforms, setPlatforms] = useState<string[]>([]);
    const [status, setStatus] = useState<ContentCalendarItem['status']>('drafting');
    const [contentType, setContentType] = useState<ContentCalendarItem['contentType']>('post');
    const [brandTag, setBrandTag] = useState('');
    const [notes, setNotes] = useState('');
    const [linkedIds, setLinkedIds] = useState<string[]>([]);

    const isEdit = !!item;

    useEffect(() => {
        if (item) {
            setTitle(item.title);
            setDescription(item.description ?? '');
            setDate(item.date);
            setPlatforms(item.platforms);
            setStatus(item.status);
            setContentType(item.contentType);
            setBrandTag(item.brandTag ?? '');
            setNotes(item.notes ?? '');
            setLinkedIds(item.linkedContentIds ?? []);
        } else {
            const today = new Date().toISOString().slice(0, 10);
            setTitle('');
            setDescription('');
            setDate(today);
            setPlatforms([]);
            setStatus('drafting');
            setContentType('post');
            setBrandTag('');
            setNotes('');
            setLinkedIds([]);
        }
    }, [item]);

    const togglePlatform = (p: string) => {
        setPlatforms((prev) =>
            prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !date) return;
        if (isEdit && item) {
            updateItem(item.id, {
                title: title.trim(),
                description: description.trim() || undefined,
                date,
                platforms,
                status,
                contentType,
                brandTag: brandTag.trim() || undefined,
                notes: notes.trim() || undefined,
                linkedContentIds: linkedIds,
            });
        } else {
            addItem({
                title: title.trim(),
                description: description.trim() || undefined,
                date,
                platforms,
                status,
                contentType,
                brandTag: brandTag.trim() || undefined,
                notes: notes.trim() || undefined,
                linkedContentIds: linkedIds,
            });
        }
        onSave();
    };

    const otherItems = getFilteredItems().filter((i) => i.id !== item?.id);

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle>{isEdit ? 'Edit content' : 'New content entry'}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="cc-title">Content title</Label>
                        <Input
                            id="cc-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Instagram Reel: Morning Routine"
                            required
                            className={INPUT_CLASS}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="cc-desc">Description (optional)</Label>
                        <Textarea
                            id="cc-desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description"
                            rows={2}
                            className={INPUT_CLASS + ' min-h-[60px]'}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="cc-date">Date</Label>
                        <Input
                            id="cc-date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            className={INPUT_CLASS}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Platforms</Label>
                        <div className="flex flex-wrap gap-2">
                            {PLATFORM_OPTIONS_CALENDAR.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => togglePlatform(opt.value)}
                                    className={`rounded-md border px-3 py-1.5 text-sm ${
                                        platforms.includes(opt.value)
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-input'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Status</Label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as ContentCalendarItem['status'])}
                                className={INPUT_CLASS}
                            >
                                {CALENDAR_STATUS_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Content type</Label>
                            <select
                                value={contentType}
                                onChange={(e) => setContentType(e.target.value as ContentCalendarItem['contentType'])}
                                className={INPUT_CLASS}
                            >
                                {CALENDAR_CONTENT_TYPE_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="cc-brand">Brand tag (optional)</Label>
                        <Input
                            id="cc-brand"
                            value={brandTag}
                            onChange={(e) => setBrandTag(e.target.value)}
                            placeholder="e.g. Education, Lifestyle"
                            className={INPUT_CLASS}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="cc-notes">Notes (optional)</Label>
                        <Textarea
                            id="cc-notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            className={INPUT_CLASS + ' min-h-[60px]'}
                        />
                    </div>
                    <div className="flex gap-2 items-center">
                        <Button type="submit">{isEdit ? 'Save' : 'Add entry'}</Button>
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        {isEdit && item && (
                            <Button
                                type="button"
                                variant="outline"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                    deleteItem(item.id);
                                    onSave();
                                }}
                            >
                                <Trash2 className="h-4 w-4 mr-1.5" />
                                Delete
                            </Button>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
