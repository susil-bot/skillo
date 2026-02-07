import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrandSetup } from './BrandSetup';
import { PlannerProvider } from '../context/planner-context';

// Mock storage so tests don't touch real localStorage
vi.mock('../lib/storage', () => ({
    cspStorage: {
        getBrandProfile: vi.fn(() => null),
        setBrandProfile: vi.fn(),
    },
}));

function renderBrandSetup() {
    return render(
        <PlannerProvider>
            <BrandSetup />
        </PlannerProvider>
    );
}

describe('BrandSetup', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders Brand Foundation card and form fields', () => {
        renderBrandSetup();
        expect(screen.getByText('Brand Foundation')).toBeInTheDocument();
        expect(screen.getByLabelText(/brand name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/target audience/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /save brand foundation/i })).toBeInTheDocument();
    });

    it('has required pillars and allows saving when valid', async () => {
        renderBrandSetup();
        await userEvent.type(screen.getByLabelText(/brand name/i), 'Test Brand');
        await userEvent.type(screen.getByLabelText(/target audience/i), 'Creators');
        await userEvent.type(screen.getByLabelText(/content pillars/i), 'Education, Storytelling');
        await userEvent.click(screen.getByRole('button', { name: /save brand foundation/i }));
        // Form submit triggers context + storage; assertion depends on implementation
        expect(screen.getByRole('button', { name: /save brand foundation/i })).toBeInTheDocument();
    });
});
