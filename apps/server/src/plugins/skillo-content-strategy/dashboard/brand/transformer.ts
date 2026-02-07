import type { BrandProfile, BrandTone, ContentGoal, Platform } from '../types';

/**
 * Form-ready shape for Brand Foundation form (initial values).
 */
export interface BrandFormState {
    brandName: string;
    targetAudience: string;
    brandTone: BrandTone;
    contentGoals: ContentGoal[];
    primaryPlatforms: Platform[];
    pillarsInput: string;
    campaignsInput: string;
}

const DEFAULTS: BrandFormState = {
    brandName: '',
    targetAudience: '',
    brandTone: 'friendly',
    contentGoals: ['awareness'],
    primaryPlatforms: ['instagram'],
    pillarsInput: '',
    campaignsInput: '',
};

/**
 * Transforms raw brand profile from storage/API into form state for the component.
 */
export function profileToFormState(profile: BrandProfile | null): BrandFormState {
    if (!profile) return DEFAULTS;
    return {
        brandName: profile.brandName ?? '',
        targetAudience: profile.targetAudience ?? '',
        brandTone: profile.brandTone ?? 'friendly',
        contentGoals: profile.contentGoals?.length ? profile.contentGoals : ['awareness'],
        primaryPlatforms: profile.primaryPlatforms?.length ? profile.primaryPlatforms : ['instagram'],
        pillarsInput: profile.contentPillars?.join(', ') ?? '',
        campaignsInput: profile.campaigns?.join(', ') ?? '',
    };
}

/**
 * Transforms form state + raw pillars/campaigns strings into BrandProfile for persistence.
 */
export function formStateToProfile(state: BrandFormState): BrandProfile {
    const contentPillars = state.pillarsInput.split(',').map((s) => s.trim()).filter(Boolean);
    const campaigns = state.campaignsInput.split(',').map((s) => s.trim()).filter(Boolean);
    return {
        brandName: state.brandName,
        targetAudience: state.targetAudience,
        brandTone: state.brandTone,
        contentGoals: state.contentGoals,
        primaryPlatforms: state.primaryPlatforms,
        contentPillars,
        campaigns: campaigns.length ? campaigns : undefined,
        schemaVersion: 1,
        updatedAt: new Date().toISOString(),
    };
}
