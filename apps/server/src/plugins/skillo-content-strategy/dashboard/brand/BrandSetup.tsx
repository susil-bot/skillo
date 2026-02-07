import { useState, useEffect } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label } from '@vendure/dashboard';
import { usePlanner } from '../context/planner-context';
import type { BrandTone, ContentGoal, Platform } from '../types';
import { BRAND_TONE_OPTIONS, CONTENT_GOAL_OPTIONS, PLATFORM_OPTIONS } from '../constants/options';
import { profileToFormState, formStateToProfile, type BrandFormState } from './transformer';

const INPUT_CLASS = 'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs';

function toggleGoal(arr: ContentGoal[], item: ContentGoal): ContentGoal[] {
    return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}
function togglePlatform(arr: Platform[], item: Platform): Platform[] {
    return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

export function BrandSetup() {
    const { brandProfile, setBrandProfile } = usePlanner();
    const [state, setState] = useState<BrandFormState>(() => profileToFormState(brandProfile));

    useEffect(() => {
        setState(profileToFormState(brandProfile));
    }, [brandProfile]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const profile = formStateToProfile(state);
        if (profile.contentGoals.length === 0 || profile.primaryPlatforms.length === 0 || !profile.contentPillars.length) return;
        setBrandProfile(profile);
    };

    return (
        <div className="max-w-2xl p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Brand Foundation</CardTitle>
                    <CardDescription>Define your brand once. Every content idea will reference this.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="brandName">Brand name</Label>
                            <Input
                                id="brandName"
                                value={state.brandName}
                                onChange={(e) => setState((s) => ({ ...s, brandName: e.target.value }))}
                                placeholder="e.g. Skillo Academy"
                                required
                                className={INPUT_CLASS}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="targetAudience">Target audience</Label>
                            <Input
                                id="targetAudience"
                                value={state.targetAudience}
                                onChange={(e) => setState((s) => ({ ...s, targetAudience: e.target.value }))}
                                placeholder="e.g. Creators"
                                required
                                className={INPUT_CLASS}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Brand tone</Label>
                            <div className="flex flex-wrap gap-2">
                                {BRAND_TONE_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setState((s) => ({ ...s, brandTone: opt.value }))}
                                        className={`rounded-md border px-3 py-1.5 text-sm ${state.brandTone === opt.value ? 'border-primary bg-primary text-primary-foreground' : 'border-input'}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Content goals</Label>
                            <div className="flex flex-wrap gap-2">
                                {CONTENT_GOAL_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() =>
                                            setState((s) => ({ ...s, contentGoals: toggleGoal(s.contentGoals, opt.value) }))
                                        }
                                        className={`rounded-md border px-3 py-1.5 text-sm ${state.contentGoals.includes(opt.value) ? 'border-primary bg-primary text-primary-foreground' : 'border-input'}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Primary platforms</Label>
                            <div className="flex flex-wrap gap-2">
                                {PLATFORM_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() =>
                                            setState((s) => ({
                                                ...s,
                                                primaryPlatforms: togglePlatform(s.primaryPlatforms, opt.value),
                                            }))
                                        }
                                        className={`rounded-md border px-3 py-1.5 text-sm ${state.primaryPlatforms.includes(opt.value) ? 'border-primary bg-primary text-primary-foreground' : 'border-input'}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pillars">Content pillars (comma-separated)</Label>
                            <Input
                                id="pillars"
                                value={state.pillarsInput}
                                onChange={(e) => setState((s) => ({ ...s, pillarsInput: e.target.value }))}
                                placeholder="Education, Storytelling, Product"
                                required
                                className={INPUT_CLASS}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="campaigns">Campaigns (optional)</Label>
                            <Input
                                id="campaigns"
                                value={state.campaignsInput}
                                onChange={(e) => setState((s) => ({ ...s, campaignsInput: e.target.value }))}
                                placeholder="Launch 2025"
                                className={INPUT_CLASS}
                            />
                        </div>
                        <Button type="submit">Save brand foundation</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
