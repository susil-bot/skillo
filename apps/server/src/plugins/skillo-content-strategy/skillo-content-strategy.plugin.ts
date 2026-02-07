import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { ContentStrategyBrandProfile } from './entities/content-strategy-brand-profile.entity';
import { ContentStrategyCard } from './entities/content-strategy-card.entity';
import { ContentStrategyService } from './services/content-strategy.service';
import { ContentStrategyResolver, contentStrategyAdminSchema } from './api/content-strategy.resolver';

/**
 * Content Strategy Planner (CSP) – admin-only add-on.
 *
 * API & data flow:
 * - Database: entities ContentStrategyBrandProfile and ContentStrategyCard (per channel).
 * - Admin GraphQL API (queries + mutations) for brand profile and content cards.
 * - Dashboard UI uses this API when available; falls back to localStorage otherwise.
 *
 * GraphQL (admin-api):
 * - Query: contentStrategyBrandProfile, contentStrategyCards
 * - Mutation: saveContentStrategyBrandProfile, createContentStrategyCard, updateContentStrategyCard, deleteContentStrategyCard
 */
@VendurePlugin({
    imports: [PluginCommonModule],
    entities: [ContentStrategyBrandProfile, ContentStrategyCard],
    adminApiExtensions: {
        schema: contentStrategyAdminSchema,
        resolvers: [ContentStrategyResolver],
    },
    providers: [ContentStrategyService],
    dashboard: './dashboard/index.tsx',
})
export class SkilloContentStrategyPlugin {}
