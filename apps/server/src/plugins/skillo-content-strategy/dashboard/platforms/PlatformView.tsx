import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@vendure/dashboard';
import { usePlanner } from '../context/planner-context';
import type { Platform } from '../types';
import { PLATFORM_OPTIONS } from '../constants/options';
import { getPlatformCounts, filterCardsByPlatform } from './transformer';

export function PlatformView() {
    const { contentCards, brandProfile } = usePlanner();
    const [selected, setSelected] = useState<Platform | 'all'>('all');

    const platformCounts = getPlatformCounts(contentCards, brandProfile?.primaryPlatforms ?? []);
    const list = filterCardsByPlatform(contentCards, selected);

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Platform view</h2>
            <div className="mb-6 flex flex-wrap gap-2">
                <button
                    onClick={() => setSelected('all')}
                    className={`rounded-md border px-3 py-1.5 text-sm font-medium ${selected === 'all' ? 'border-primary bg-primary text-primary-foreground' : 'border-input'}`}
                >
                    All ({contentCards.length})
                </button>
                {PLATFORM_OPTIONS.filter((p) => p.value !== 'other').map((opt) => {
                    const info = platformCounts.find((pc) => pc.platform === opt.value);
                    const count = info?.count ?? 0;
                    const isPrimary = info?.isPrimary ?? false;
                    return (
                        <button
                            key={opt.value}
                            onClick={() => setSelected(opt.value as Platform)}
                            className={`rounded-md border px-3 py-1.5 text-sm font-medium flex items-center gap-1.5 ${selected === opt.value ? 'border-primary bg-primary text-primary-foreground' : 'border-input'}`}
                        >
                            {opt.label} ({count})
                            {isPrimary && (
                                <Badge variant="secondary" className="text-[10px]">
                                    Primary
                                </Badge>
                            )}
                        </button>
                    );
                })}
            </div>
            {list.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        {selected === 'all' ? 'Add content in the Planner.' : `No content for ${selected}.`}
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {list.map((card) => (
                        <Card key={card.id}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">{card.title}</CardTitle>
                                <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                                    <Badge variant="outline" className="capitalize">
                                        {card.contentType}
                                    </Badge>
                                    <Badge variant="secondary" className="capitalize">
                                        {card.status}
                                    </Badge>
                                    {card.relatedPillar && <span>· {card.relatedPillar}</span>}
                                    {card.goal && <span>· {card.goal}</span>}
                                </div>
                            </CardHeader>
                            {(card.hook || card.keyMessage) && (
                                <CardContent className="pt-0 text-sm text-muted-foreground">
                                    {card.hook && <p className="line-clamp-1">Hook: {card.hook}</p>}
                                    {card.keyMessage && <p className="line-clamp-2 mt-1">Message: {card.keyMessage}</p>}
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
