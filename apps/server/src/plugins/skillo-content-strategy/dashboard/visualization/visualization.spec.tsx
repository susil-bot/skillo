import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RelationshipView } from './RelationshipView';
import { PlannerProvider } from '../context/planner-context';
import { groupCardsBy, getGroupByLabel } from './transformer';

vi.mock('../lib/storage', () => ({
    cspStorage: {
        getBrandProfile: vi.fn(() => null),
        setBrandProfile: vi.fn(),
        getContentCards: vi.fn(() => []),
        setContentCards: vi.fn(),
    },
}));

function renderVisualization() {
    return render(
        <PlannerProvider>
            <RelationshipView />
        </PlannerProvider>
    );
}

describe('RelationshipView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders Content relationship view and group-by buttons', () => {
        renderVisualization();
        expect(screen.getByText('Content relationship view')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /pillar/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /goal/i })).toBeInTheDocument();
    });

    it('shows empty state when no cards', () => {
        renderVisualization();
        expect(screen.getByText(/add content in the planner first/i)).toBeInTheDocument();
    });
});

describe('visualization transformer', () => {
    it('getGroupByLabel returns correct labels', () => {
        expect(getGroupByLabel('pillar')).toBe('Pillar');
        expect(getGroupByLabel('goal')).toBe('Goal');
        expect(getGroupByLabel('platform')).toBe('Platform');
    });

    it('groupCardsBy groups by pillar', () => {
        const cards = [
            { id: '1', relatedPillar: 'Education', goal: 'awareness', platform: 'instagram' } as any,
            { id: '2', relatedPillar: 'Education', goal: 'leads', platform: 'youtube' } as any,
            { id: '3', relatedPillar: 'Storytelling', goal: 'awareness', platform: 'instagram' } as any,
        ];
        const result = groupCardsBy(cards, 'pillar');
        expect(result).toHaveLength(2);
        const education = result.find((e) => e.key === 'Education');
        expect(education?.cards).toHaveLength(2);
        const storytelling = result.find((e) => e.key === 'Storytelling');
        expect(storytelling?.cards).toHaveLength(1);
    });
});
