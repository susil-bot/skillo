import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import gql from 'graphql-tag';
import { Allow, Ctx, Permission, RequestContext, Transaction } from '@vendure/core';
import { ContentStrategyService } from '../services/content-strategy.service';
import type {
    ContentStrategyBrandProfileDto,
    ContentStrategyCardDto,
} from '../services/content-strategy.service';

// GraphQL schema extension for admin API
export const contentStrategyAdminSchema = gql`
    type ContentStrategyBrandProfileDto {
        brandName: String!
        targetAudience: String!
        brandTone: String!
        contentGoals: [String!]!
        primaryPlatforms: [String!]!
        contentPillars: [String!]!
        campaigns: [String!]
        schemaVersion: Int
        updatedAt: String
    }

    type ContentStrategyCardDto {
        id: ID!
        title: String!
        platform: String!
        contentType: String!
        hook: String
        keyMessage: String
        cta: String
        relatedPillar: String
        goal: String
        campaign: String
        status: String!
        createdAt: String!
        updatedAt: String!
        scheduledFor: String
    }

    input ContentStrategyBrandProfileInput {
        brandName: String!
        targetAudience: String!
        brandTone: String!
        contentGoals: [String!]!
        primaryPlatforms: [String!]!
        contentPillars: [String!]!
        campaigns: [String!]
        schemaVersion: Int
    }

    input ContentStrategyCardInput {
        title: String!
        platform: String!
        contentType: String!
        hook: String
        keyMessage: String
        cta: String
        relatedPillar: String
        goal: String
        campaign: String
        status: String!
        scheduledFor: String
    }

    input ContentStrategyCardUpdateInput {
        title: String
        platform: String
        contentType: String
        hook: String
        keyMessage: String
        cta: String
        relatedPillar: String
        goal: String
        campaign: String
        status: String
        scheduledFor: String
    }

    extend type Query {
        contentStrategyBrandProfile: ContentStrategyBrandProfileDto
        contentStrategyCards: [ContentStrategyCardDto!]!
    }

    extend type Mutation {
        saveContentStrategyBrandProfile(input: ContentStrategyBrandProfileInput!): ContentStrategyBrandProfileDto!
        createContentStrategyCard(input: ContentStrategyCardInput!): ContentStrategyCardDto!
        updateContentStrategyCard(id: ID!, input: ContentStrategyCardUpdateInput!): ContentStrategyCardDto
        deleteContentStrategyCard(id: ID!): Boolean!
    }
`;

@Resolver()
export class ContentStrategyResolver {
    constructor(private contentStrategyService: ContentStrategyService) {}

    @Query()
    @Allow(Permission.Authenticated)
    async contentStrategyBrandProfile(
        @Ctx() ctx: RequestContext,
    ): Promise<ContentStrategyBrandProfileDto | null> {
        return this.contentStrategyService.getBrandProfile(ctx);
    }

    @Query()
    @Allow(Permission.Authenticated)
    async contentStrategyCards(@Ctx() ctx: RequestContext): Promise<ContentStrategyCardDto[]> {
        return this.contentStrategyService.getContentCards(ctx);
    }

    @Transaction()
    @Mutation()
    @Allow(Permission.Authenticated)
    async saveContentStrategyBrandProfile(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: ContentStrategyBrandProfileDto },
    ): Promise<ContentStrategyBrandProfileDto> {
        const result = await this.contentStrategyService.saveBrandProfile(ctx, args.input);
        return result as ContentStrategyBrandProfileDto;
    }

    @Transaction()
    @Mutation()
    @Allow(Permission.Authenticated)
    async createContentStrategyCard(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: Omit<ContentStrategyCardDto, 'id' | 'createdAt' | 'updatedAt'> },
    ): Promise<ContentStrategyCardDto> {
        return this.contentStrategyService.createContentCard(ctx, args.input) as Promise<ContentStrategyCardDto>;
    }

    @Transaction()
    @Mutation()
    @Allow(Permission.Authenticated)
    async updateContentStrategyCard(
        @Ctx() ctx: RequestContext,
        @Args() args: { id: string; input: Partial<ContentStrategyCardDto> },
    ): Promise<ContentStrategyCardDto | null> {
        return this.contentStrategyService.updateContentCard(ctx, args.id, args.input);
    }

    @Transaction()
    @Mutation()
    @Allow(Permission.Authenticated)
    async deleteContentStrategyCard(
        @Ctx() ctx: RequestContext,
        @Args() args: { id: string },
    ): Promise<boolean> {
        return this.contentStrategyService.deleteContentCard(ctx, args.id);
    }
}
