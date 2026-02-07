import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlannerBoard } from './PlannerBoard';
import { PlannerProvider } from '../context/planner-context';

vi.mock('../lib/storage', () => ({
    cspStorage: {
        getBrandProfile: vi.fn(() => null),
        setBrandProfile: vi.fn(),
        getContentCards: vi.fn(() => []),
        setContentCards: vi.fn(),
    },
}));

function renderPlannerBoard() {
    return render(
        <PlannerProvider>
            <PlannerBoard />
        </PlannerProvider>
    );
}

describe('PlannerBoard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders Content Planner heading and Add content idea button', () => {
        renderPlannerBoard();
        expect(screen.getByText('Content Planner')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add content idea/i })).toBeInTheDocument();
    });

    it('shows empty state when no cards', () => {
        renderPlannerBoard();
        expect(screen.getByText('No content ideas yet')).toBeInTheDocument();
    });

    it('opens new card form when Add content idea is clicked', async () => {
        renderPlannerBoard();
        await userEvent.click(screen.getByRole('button', { name: /add content idea/i }));
        expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add card/i })).toBeInTheDocument();
    });
});
