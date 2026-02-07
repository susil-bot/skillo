import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@vendure/dashboard';
import { usePlanner } from '../context/planner-context';
import type { RelationshipGroupBy } from '../types';
import { groupCardsBy, getGroupByLabel } from './transformer';

export function RelationshipView() {
    const { contentCards } = usePlanner();
    const [groupBy, setGroupBy] = useState<RelationshipGroupBy>('pillar');

    const entries = groupCardsBy(contentCards, groupBy);

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Content relationship view</h2>
            <div className="mb-4 flex flex-wrap gap-2">
                {(['pillar', 'goal', 'campaign', 'platform'] as const).map((key) => (
                    <Button
                        key={key}
                        variant={groupBy === key ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setGroupBy(key)}
                    >
                        {getGroupByLabel(key)}
                    </Button>
                ))}
            </div>
            {contentCards.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        Add content in the Planner first.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {entries.map(({ key, cards }) => (
                        <Card key={key}>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    {key} <Badge variant="secondary">{cards.length}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {cards.map((card) => (
                                        <li
                                            key={card.id}
                                            className="flex items-center gap-2 rounded-md border border-border bg-muted/20 px-3 py-2 text-sm"
                                        >
                                            <span className="font-medium flex-1 truncate">{card.title}</span>
                                            <span className="text-muted-foreground capitalize">{card.platform}</span>
                                            <Badge variant="outline" className="capitalize">
                                                {card.status}
                                            </Badge>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
