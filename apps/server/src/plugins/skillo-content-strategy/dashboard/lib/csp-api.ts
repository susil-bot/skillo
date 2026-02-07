/**
 * CSP Admin API client. Calls the Content Strategy GraphQL API (admin-api).
 * Uses the same auth as the dashboard (session + channel token in localStorage).
 */

const LS_SESSION = 'vendure-session-token';
const LS_CHANNEL = 'vendure-selected-channel-token';
const CHANNEL_TOKEN_HEADER = 'vendure-token';

function getAdminApiUrl(): string {
    if (typeof location === 'undefined') return '';
    const base = `${location.protocol}//${location.host}`;
    return `${base}/admin-api`;
}

async function graphqlRequest<T>(document: string, variables?: Record<string, unknown>): Promise<T> {
    const url = getAdminApiUrl();
    const session = typeof localStorage !== 'undefined' ? localStorage.getItem(LS_SESSION) : null;
    const channel = typeof localStorage !== 'undefined' ? localStorage.getItem(LS_CHANNEL) : null;
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(session && { Authorization: `Bearer ${session}` }),
        ...(channel && { [CHANNEL_TOKEN_HEADER]: channel }),
    };
    const res = await fetch(url, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ query: document, variables: variables ?? {} }),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`CSP API error ${res.status}: ${text}`);
    }
    const json = (await res.json()) as { data?: T; errors?: Array<{ message: string }> };
    if (json.errors?.length) {
        throw new Error(json.errors.map((e) => e.message).join('; '));
    }
    if (json.data == null) throw new Error('No data in CSP API response');
    return json.data as T;
}

const QUERY_BRAND_PROFILE = `
  query ContentStrategyBrandProfile {
    contentStrategyBrandProfile {
      brandName
      targetAudience
      brandTone
      contentGoals
      primaryPlatforms
      contentPillars
      campaigns
      schemaVersion
      updatedAt
    }
  }
`;

const QUERY_CARDS = `
  query ContentStrategyCards {
    contentStrategyCards {
      id
      title
      platform
      contentType
      hook
      keyMessage
      cta
      relatedPillar
      goal
      campaign
      status
      createdAt
      updatedAt
      scheduledFor
    }
  }
`;

const MUTATION_SAVE_BRAND = `
  mutation SaveContentStrategyBrandProfile($input: ContentStrategyBrandProfileInput!) {
    saveContentStrategyBrandProfile(input: $input) {
      brandName
      targetAudience
      brandTone
      contentGoals
      primaryPlatforms
      contentPillars
      campaigns
      schemaVersion
      updatedAt
    }
  }
`;

const MUTATION_CREATE_CARD = `
  mutation CreateContentStrategyCard($input: ContentStrategyCardInput!) {
    createContentStrategyCard(input: $input) {
      id
      title
      platform
      contentType
      hook
      keyMessage
      cta
      relatedPillar
      goal
      campaign
      status
      createdAt
      updatedAt
      scheduledFor
    }
  }
`;

const MUTATION_UPDATE_CARD = `
  mutation UpdateContentStrategyCard($id: ID!, $input: ContentStrategyCardUpdateInput!) {
    updateContentStrategyCard(id: $id, input: $input) {
      id
      title
      platform
      contentType
      hook
      keyMessage
      cta
      relatedPillar
      goal
      campaign
      status
      createdAt
      updatedAt
      scheduledFor
    }
  }
`;

const MUTATION_DELETE_CARD = `
  mutation DeleteContentStrategyCard($id: ID!) {
    deleteContentStrategyCard(id: $id)
  }
`;

export interface ContentStrategyBrandProfileDto {
    brandName: string;
    targetAudience: string;
    brandTone: string;
    contentGoals: string[];
    primaryPlatforms: string[];
    contentPillars: string[];
    campaigns?: string[];
    schemaVersion?: number;
    updatedAt?: string;
}

export interface ContentStrategyCardDto {
    id: string;
    title: string;
    platform: string;
    contentType: string;
    hook?: string;
    keyMessage?: string;
    cta?: string;
    relatedPillar?: string;
    goal?: string;
    campaign?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    scheduledFor?: string;
}

export const cspApi = {
    async getBrandProfile(): Promise<ContentStrategyBrandProfileDto | null> {
        const data = await graphqlRequest<{ contentStrategyBrandProfile: ContentStrategyBrandProfileDto | null }>(
            QUERY_BRAND_PROFILE
        );
        return data.contentStrategyBrandProfile;
    },

    async saveBrandProfile(input: Omit<ContentStrategyBrandProfileDto, 'updatedAt'>): Promise<ContentStrategyBrandProfileDto> {
        const data = await graphqlRequest<{ saveContentStrategyBrandProfile: ContentStrategyBrandProfileDto }>(
            MUTATION_SAVE_BRAND,
            { input }
        );
        return data.saveContentStrategyBrandProfile;
    },

    async getContentCards(): Promise<ContentStrategyCardDto[]> {
        const data = await graphqlRequest<{ contentStrategyCards: ContentStrategyCardDto[] }>(QUERY_CARDS);
        return data.contentStrategyCards;
    },

    async createContentCard(
        input: Omit<ContentStrategyCardDto, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<ContentStrategyCardDto> {
        const data = await graphqlRequest<{ createContentStrategyCard: ContentStrategyCardDto }>(
            MUTATION_CREATE_CARD,
            { input }
        );
        return data.createContentStrategyCard;
    },

    async updateContentCard(
        id: string,
        input: Partial<Omit<ContentStrategyCardDto, 'id' | 'createdAt' | 'updatedAt'>>
    ): Promise<ContentStrategyCardDto | null> {
        const data = await graphqlRequest<{ updateContentStrategyCard: ContentStrategyCardDto | null }>(
            MUTATION_UPDATE_CARD,
            { id, input }
        );
        return data.updateContentStrategyCard;
    },

    async deleteContentCard(id: string): Promise<boolean> {
        const data = await graphqlRequest<{ deleteContentStrategyCard: boolean }>(MUTATION_DELETE_CARD, { id });
        return data.deleteContentStrategyCard;
    },
};

/** Detect if we should use API (server available) vs localStorage. */
export async function cspApiAvailable(): Promise<boolean> {
    try {
        await cspApi.getBrandProfile();
        return true;
    } catch {
        return false;
    }
}
