import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import type { BrandProfile, ContentCard } from '../types';
import { cspStorage } from '../lib/storage';
import { cspApi } from '../lib/csp-api';
import { buildContentPrompt } from '../lib/prompts';

const STORAGE_PREFIX = 'skillo-content-planner';

/** Map API DTO to frontend BrandProfile (same shape; optional updatedAt). */
function dtoToBrandProfile(dto: { updatedAt?: string } & BrandProfile): BrandProfile {
    const { updatedAt: _, ...rest } = dto;
    return rest as BrandProfile;
}

/** Map API card DTO to frontend ContentCard. */
function dtoToContentCard(dto: import('../lib/csp-api').ContentStrategyCardDto): ContentCard {
    return {
        id: dto.id,
        title: dto.title,
        platform: dto.platform as ContentCard['platform'],
        contentType: dto.contentType as ContentCard['contentType'],
        hook: dto.hook,
        keyMessage: dto.keyMessage,
        cta: dto.cta,
        relatedPillar: dto.relatedPillar,
        goal: dto.goal as ContentCard['goal'],
        campaign: dto.campaign,
        status: dto.status as ContentCard['status'],
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt,
        scheduledFor: dto.scheduledFor,
    };
}

interface PlannerContextValue {
    brandProfile: BrandProfile | null;
    contentCards: ContentCard[];
    setBrandProfile: (profile: BrandProfile) => void | Promise<void>;
    addContentCard: (card: Omit<ContentCard, 'id' | 'createdAt' | 'updatedAt'>) => ContentCard | Promise<ContentCard>;
    updateContentCard: (id: string, updates: Partial<ContentCard>) => void | Promise<void>;
    removeContentCard: (id: string) => void | Promise<void>;
    getPromptForCard: (card: ContentCard) => string;
    hasBrand: boolean;
    /** True when data is loaded from/saved to API (DB); false when using localStorage only. */
    usingApi: boolean;
}

const PlannerContext = createContext<PlannerContextValue | null>(null);

function generateId(): string {
    return crypto.randomUUID();
}

export function PlannerProvider({ children }: { children: ReactNode }) {
    const [brandProfile, setBrandProfileState] = useState<BrandProfile | null>(null);
    const [contentCards, setContentCardsState] = useState<ContentCard[]>([]);
    const [usingApi, setUsingApi] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const useApiRef = useRef(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [profileRes, cardsRes] = await Promise.all([
                    cspApi.getBrandProfile(),
                    cspApi.getContentCards(),
                ]);
                if (!cancelled) {
                    setBrandProfileState(profileRes ? dtoToBrandProfile(profileRes as BrandProfile & { updatedAt?: string }) : null);
                    setContentCardsState((cardsRes ?? []).map(dtoToContentCard));
                    useApiRef.current = true;
                    setUsingApi(true);
                }
            } catch {
                if (!cancelled) {
                    setBrandProfileState(cspStorage.getBrandProfile(STORAGE_PREFIX));
                    setContentCardsState(cspStorage.getContentCards(STORAGE_PREFIX));
                    useApiRef.current = false;
                    setUsingApi(false);
                }
            } finally {
                if (!cancelled) setLoaded(true);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const setBrandProfile = useCallback(async (profile: BrandProfile) => {
        if (useApiRef.current) {
            try {
                const saved = await cspApi.saveBrandProfile(profile);
                setBrandProfileState(dtoToBrandProfile(saved as BrandProfile & { updatedAt?: string }));
                cspStorage.setBrandProfile(profile, STORAGE_PREFIX);
            } catch {
                setBrandProfileState(profile);
                cspStorage.setBrandProfile(profile, STORAGE_PREFIX);
            }
        } else {
            setBrandProfileState(profile);
            cspStorage.setBrandProfile(profile, STORAGE_PREFIX);
        }
    }, []);

    const addContentCard = useCallback(
        async (card: Omit<ContentCard, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContentCard> => {
            if (useApiRef.current) {
                try {
                    const created = await cspApi.createContentCard({
                        title: card.title,
                        platform: card.platform,
                        contentType: card.contentType,
                        hook: card.hook,
                        keyMessage: card.keyMessage,
                        cta: card.cta,
                        relatedPillar: card.relatedPillar,
                        goal: card.goal,
                        campaign: card.campaign,
                        status: card.status,
                        scheduledFor: card.scheduledFor,
                    });
                    const mapped = dtoToContentCard(created);
                    setContentCardsState((prev) => {
                        const next = [mapped, ...prev];
                        cspStorage.setContentCards(next, STORAGE_PREFIX);
                        return next;
                    });
                    return mapped;
                } catch {
                    const now = new Date().toISOString();
                    const newCard: ContentCard = { ...card, id: generateId(), createdAt: now, updatedAt: now };
                    setContentCardsState((prev) => {
                        const next = [...prev, newCard];
                        cspStorage.setContentCards(next, STORAGE_PREFIX);
                        return next;
                    });
                    return newCard;
                }
            }
            const now = new Date().toISOString();
            const newCard: ContentCard = { ...card, id: generateId(), createdAt: now, updatedAt: now };
            setContentCardsState((prev) => {
                const next = [...prev, newCard];
                cspStorage.setContentCards(next, STORAGE_PREFIX);
                return next;
            });
            return newCard;
        },
        []
    );

    const updateContentCard = useCallback(async (id: string, updates: Partial<ContentCard>) => {
        if (useApiRef.current) {
            try {
                const updated = await cspApi.updateContentCard(id, updates);
                if (updated) {
                    setContentCardsState((prev) => {
                        const next = prev.map((c) => (c.id === id ? dtoToContentCard(updated) : c));
                        cspStorage.setContentCards(next, STORAGE_PREFIX);
                        return next;
                    });
                } else {
                    setContentCardsState((prev) => {
                        const next = prev.map((c) =>
                            c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
                        );
                        cspStorage.setContentCards(next, STORAGE_PREFIX);
                        return next;
                    });
                }
            } catch {
                setContentCardsState((prev) => {
                    const next = prev.map((c) =>
                        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
                    );
                    cspStorage.setContentCards(next, STORAGE_PREFIX);
                    return next;
                });
            }
            return;
        }
        setContentCardsState((prev) => {
            const next = prev.map((c) =>
                c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
            );
            cspStorage.setContentCards(next, STORAGE_PREFIX);
            return next;
        });
    }, []);

    const removeContentCard = useCallback(async (id: string) => {
        if (useApiRef.current) {
            try {
                await cspApi.deleteContentCard(id);
            } catch {
                // continue to remove from local state
            }
        }
        setContentCardsState((prev) => {
            const next = prev.filter((c) => c.id !== id);
            cspStorage.setContentCards(next, STORAGE_PREFIX);
            return next;
        });
    }, []);

    const getPromptForCard = useCallback(
        (card: ContentCard): string => {
            if (!brandProfile) return 'Set up your Brand Foundation first to get prompts.';
            return buildContentPrompt(brandProfile, card);
        },
        [brandProfile]
    );

    const value = useMemo<PlannerContextValue>(
        () => ({
            brandProfile,
            contentCards,
            setBrandProfile,
            addContentCard,
            updateContentCard,
            removeContentCard,
            getPromptForCard,
            hasBrand: !!brandProfile,
            usingApi: usingApi && loaded,
        }),
        [
            brandProfile,
            contentCards,
            setBrandProfile,
            addContentCard,
            updateContentCard,
            removeContentCard,
            getPromptForCard,
            usingApi,
            loaded,
        ]
    );

    return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}

export function usePlanner() {
    const ctx = useContext(PlannerContext);
    if (!ctx) throw new Error('usePlanner must be used within PlannerProvider');
    return ctx;
}
