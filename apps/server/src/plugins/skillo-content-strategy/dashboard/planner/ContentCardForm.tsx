import { useState } from 'react';
import { Button, Input, Label, Textarea } from '@vendure/dashboard';
import { usePlanner } from '../context/planner-context';
import type { ContentCard, ContentGoal, ContentType, ContentStatus, Platform } from '../types';
import { CONTENT_GOAL_OPTIONS, PLATFORM_OPTIONS, CONTENT_TYPE_OPTIONS, CONTENT_STATUS_OPTIONS } from '../constants/options';

const INPUT_CLASS = 'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs';

function NativeSelect({
    value,
    onChange,
    options,
    className = '',
}: {
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    className?: string;
}) {
    return (
        <select value={value} onChange={(e) => onChange(e.target.value)} className={INPUT_CLASS + ' ' + className}>
            {options.map((o) => (
                <option key={o.value} value={o.value}>
                    {o.label}
                </option>
            ))}
        </select>
    );
}

export function ContentCardForm({
    card,
    onSave,
    onCancel,
    isNew,
}: {
    card: ContentCard;
    onSave: (u: Partial<ContentCard>) => void;
    onCancel?: () => void;
    isNew?: boolean;
}) {
    const { brandProfile } = usePlanner();
    const [title, setTitle] = useState(card.title);
    const [platform, setPlatform] = useState<Platform>(card.platform);
    const [contentType, setContentType] = useState<ContentType>(card.contentType);
    const [hook, setHook] = useState(card.hook ?? '');
    const [keyMessage, setKeyMessage] = useState(card.keyMessage ?? '');
    const [cta, setCta] = useState(card.cta ?? '');
    const [relatedPillar, setRelatedPillar] = useState(card.relatedPillar ?? '');
    const [goal, setGoal] = useState<ContentGoal | ''>(card.goal ?? '');
    const [status, setStatus] = useState<ContentStatus>(card.status);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            title,
            platform,
            contentType,
            hook: hook || undefined,
            keyMessage: keyMessage || undefined,
            cta: cta || undefined,
            relatedPillar: relatedPillar || undefined,
            goal: goal || undefined,
            status,
        });
        onCancel?.();
    };

    const pillarOpts = (brandProfile?.contentPillars ?? []).map((p) => ({ value: p, label: p }));
    const goalOpts = [{ value: '', label: '—' }, ...CONTENT_GOAL_OPTIONS];

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
            <div className="grid gap-2">
                <Label htmlFor="csp-title">Title</Label>
                <Input id="csp-title" value={title} onChange={(e) => setTitle(e.target.value)} required className={INPUT_CLASS} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>Platform</Label>
                    <NativeSelect value={platform} onChange={(v) => setPlatform(v as Platform)} options={PLATFORM_OPTIONS} />
                </div>
                <div className="grid gap-2">
                    <Label>Content type</Label>
                    <NativeSelect value={contentType} onChange={(v) => setContentType(v as ContentType)} options={CONTENT_TYPE_OPTIONS} />
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="hook">Hook</Label>
                <Textarea id="hook" value={hook} onChange={(e) => setHook(e.target.value)} rows={2} className={INPUT_CLASS + ' min-h-[60px]'} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="msg">Key message</Label>
                <Textarea id="msg" value={keyMessage} onChange={(e) => setKeyMessage(e.target.value)} rows={2} className={INPUT_CLASS + ' min-h-[60px]'} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="cta">CTA</Label>
                <Input id="cta" value={cta} onChange={(e) => setCta(e.target.value)} className={INPUT_CLASS} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>Pillar</Label>
                    <NativeSelect
                        value={relatedPillar}
                        onChange={setRelatedPillar}
                        options={pillarOpts.length ? pillarOpts : [{ value: '', label: '—' }]}
                    />
                </div>
                <div className="grid gap-2">
                    <Label>Goal</Label>
                    <NativeSelect value={goal} onChange={(v) => setGoal(v as ContentGoal | '')} options={goalOpts} />
                </div>
            </div>
            <div className="grid gap-2">
                <Label>Status</Label>
                <NativeSelect value={status} onChange={(v) => setStatus(v as ContentStatus)} options={CONTENT_STATUS_OPTIONS} />
            </div>
            <div className="flex gap-2">
                <Button type="submit">{isNew ? 'Add card' : 'Save'}</Button>
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    );
}
