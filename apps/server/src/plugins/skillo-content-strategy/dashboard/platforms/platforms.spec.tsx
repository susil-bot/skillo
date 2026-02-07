import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlatformView } from './PlatformView';
import { PlannerProvider } from '../context/planner-context';
import { getPlatformCounts, filterCardsByPlatform } from './transformer';
import type { ContentCard, Platform } from '../types';

vi.mock('../lib/storage', () => ({
    cspStorage: {
        getBrandProfile: vi.fn(() => null),
        setBrandProfile: vi.fn(),
        getContentCards: vi.fn(() => []),
        setContentCards: vi.fn(),
    },
}));

function renderPlatformView() {
    return render(
        <PlannerProvider>
            <PlatformView />
        </PlannerProvider>
    );
}

describe('PlatformView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders Platform view and All button', () => {
        renderPlatformView();
        expect(screen.getByText('Platform view')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /all \(0\)/i })).toBeInTheDocument();
    });

    it('shows empty state when no cards', () => {
        renderPlatformView();
        expect(screen.getByText(/add content in the planner/i)).toBeInTheDocument();
    });
});

describe('platforms transformer', () => {
    it('getPlatformCounts returns counts and primary flag', () => {
        const cards: ContentCard[] = [
            { id: '1', platform: 'instagram', title: '', contentType: 'post', status: 'idea', createdAt: '', updatedAt: '' },
            { id: '2', platform: 'instagram', title: '', contentType: 'reel', status: 'draft', createdAt: '', updatedAt: '' },
        ] as ContentCard[];
        const counts = getPlatformCounts(cards, ['instagram']);
        const ig = counts.find((c) => c.platform === 'instagram');
        expect(ig?.count).toBe(2);
        expect(ig?.isPrimary).toBe(true);
    });

    it('filterCardsByPlatform filters by platform', () => {
        const cards: ContentCard[] = [
            { id: '1', platform: 'instagram', title: 'A', contentType: 'post', status: 'idea', createdAt: '', updatedAt: '' },
            { id: '2', platform: 'youtube', title: 'B', contentType: 'video', status: 'idea', createdAt: '', updatedAt: '' },
        ] as ContentCard[];
        expect(filterCardsByPlatform(cards, 'all')).toHaveLength(2);
        expect(filterCardsByPlatform(cards, 'instagram' as Platform)).toHaveLength(1);
        expect(filterCardsByPlatform(cards, 'youtube' as Platform)).toHaveLength(1);
    });
});
