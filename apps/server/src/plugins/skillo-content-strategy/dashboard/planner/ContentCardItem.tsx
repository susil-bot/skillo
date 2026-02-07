import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, CardFooter, Badge } from '@vendure/dashboard';
import { Sparkles, ChevronDown, ChevronUp, Trash2, Copy } from 'lucide-react';
import { usePlanner } from '../context/planner-context';
import type { ContentCard } from '../types';
import { ContentCardForm } from './ContentCardForm';

export function ContentCardItem({ card, onRemove }: { card: ContentCard; onRemove: (id: string) => void }) {
    const { getPromptForCard, updateContentCard } = usePlanner();
    const [showPrompt, setShowPrompt] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const prompt = getPromptForCard(card);

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-tight line-clamp-2">{card.title}</CardTitle>
                    <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="capitalize">
                            {card.status}
                        </Badge>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => onRemove(card.id)}
                            aria-label="Remove"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground capitalize">
                    {card.platform} · {card.contentType}
                    {card.relatedPillar ? ` · ${card.relatedPillar}` : ''}
                </p>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
                {card.hook && (
                    <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Hook:</span> {card.hook}
                    </p>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 text-muted-foreground"
                    onClick={() => setShowPrompt((p) => !p)}
                >
                    <Sparkles className="h-4 w-4" />
                    Prompt Assistant {showPrompt ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
                </Button>
                {showPrompt && (
                    <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
                        <p className="text-muted-foreground whitespace-pre-wrap">{prompt}</p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 gap-1.5"
                            onClick={() => navigator.clipboard.writeText(prompt)}
                        >
                            <Copy className="h-3.5 w-3.5" /> Copy prompt
                        </Button>
                    </div>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => setExpanded((e) => !e)}
                >
                    {expanded ? 'Collapse' : 'Edit'} {expanded ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                </Button>
                {expanded && (
                    <ContentCardForm
                        card={card}
                        onSave={(u) => updateContentCard(card.id, u)}
                        onCancel={() => setExpanded(false)}
                    />
                )}
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground pt-0">
                Updated {new Date(card.updatedAt).toLocaleDateString()}
            </CardFooter>
        </Card>
    );
}
