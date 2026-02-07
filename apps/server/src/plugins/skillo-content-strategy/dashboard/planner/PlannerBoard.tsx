import { useState } from 'react';
import { Button } from '@vendure/dashboard';
import { Plus } from 'lucide-react';
import { usePlanner } from '../context/planner-context';
import type { ContentCard } from '../types';
import { getDefaultCardInput } from './transformer';
import { ContentCardForm } from './ContentCardForm';
import { ContentCardItem } from './ContentCardItem';
import { sortCardsByUpdated } from './transformer';

export function PlannerBoard() {
    const { contentCards, addContentCard, removeContentCard, brandProfile } = usePlanner();
    const [showNewForm, setShowNewForm] = useState(false);
    const defaultCardInput = getDefaultCardInput(brandProfile);
    const defaultCard: Omit<ContentCard, 'id' | 'createdAt' | 'updatedAt'> = {
        title: defaultCardInput.title,
        platform: defaultCardInput.platform,
        contentType: defaultCardInput.contentType,
        status: defaultCardInput.status,
        relatedPillar: defaultCardInput.relatedPillar,
        goal: defaultCardInput.goal,
    };

    const handleAdd = async (updates: Partial<ContentCard>) => {
        await addContentCard({ ...defaultCard, ...updates });
        setShowNewForm(false);
    };

    const sortedCards = sortCardsByUpdated(contentCards);

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Content Planner</h2>
                    <p className="text-muted-foreground text-sm">Add ideas. Each card references your brand.</p>
                </div>
                <Button onClick={() => setShowNewForm((v) => !v)} className="gap-2">
                    <Plus className="h-4 w-4" /> Add content idea
                </Button>
            </div>
            {showNewForm && (
                <div className="mb-6">
                    <ContentCardForm
                        card={{ ...defaultCard, id: '', createdAt: '', updatedAt: '' } as ContentCard}
                        onSave={handleAdd}
                        onCancel={() => setShowNewForm(false)}
                        isNew
                    />
                </div>
            )}
            {contentCards.length === 0 && !showNewForm ? (
                <div className="rounded-lg border border-dashed border-border bg-muted/20 py-12 text-center text-muted-foreground">
                    <p className="font-medium">No content ideas yet</p>
                    <Button className="mt-4" onClick={() => setShowNewForm(true)}>
                        Add content idea
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {sortedCards.map((card) => (
                        <ContentCardItem key={card.id} card={card} onRemove={removeContentCard} />
                    ))}
                </div>
            )}
        </div>
    );
}
