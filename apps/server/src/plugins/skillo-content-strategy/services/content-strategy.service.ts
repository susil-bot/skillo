import { Injectable } from '@nestjs/common';
import { RequestContext, TransactionalConnection } from '@vendure/core';
import { ContentStrategyBrandProfile } from '../entities/content-strategy-brand-profile.entity';
import { ContentStrategyCard } from '../entities/content-strategy-card.entity';

/** DTO matching dashboard BrandProfile (API shape). */
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

/** DTO matching dashboard ContentCard (API shape). */
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

@Injectable()
export class ContentStrategyService {
    constructor(private connection: TransactionalConnection) {}

    async getBrandProfile(ctx: RequestContext): Promise<ContentStrategyBrandProfileDto | null> {
        const repo = this.connection.getRepository(ctx, ContentStrategyBrandProfile);
        const row = await repo.findOne({
            where: { channelId: ctx.channelId },
        });
        if (!row) return null;
        return this.brandEntityToDto(row);
    }

    async saveBrandProfile(
        ctx: RequestContext,
        input: ContentStrategyBrandProfileDto,
    ): Promise<ContentStrategyBrandProfileDto> {
        const repo = this.connection.getRepository(ctx, ContentStrategyBrandProfile);
        let row = await repo.findOne({ where: { channelId: ctx.channelId } });
        const channel = ctx.channel;
        if (!channel) throw new Error('No active channel');
        if (!row) {
            row = repo.create({
                channelId: channel.id,
                channel,
                brandName: input.brandName,
                targetAudience: input.targetAudience,
                brandTone: input.brandTone,
                contentGoals: input.contentGoals ?? [],
                primaryPlatforms: input.primaryPlatforms ?? [],
                contentPillars: input.contentPillars ?? [],
                campaigns: input.campaigns ?? null,
                schemaVersion: input.schemaVersion ?? 1,
            });
        } else {
            row.brandName = input.brandName;
            row.targetAudience = input.targetAudience;
            row.brandTone = input.brandTone;
            row.contentGoals = input.contentGoals ?? [];
            row.primaryPlatforms = input.primaryPlatforms ?? [];
            row.contentPillars = input.contentPillars ?? [];
            row.campaigns = input.campaigns ?? null;
            row.schemaVersion = input.schemaVersion ?? 1;
        }
        const saved = await repo.save(row);
        return this.brandEntityToDto(saved);
    }

    async getContentCards(ctx: RequestContext): Promise<ContentStrategyCardDto[]> {
        const repo = this.connection.getRepository(ctx, ContentStrategyCard);
        const rows = await repo.find({
            where: { channelId: ctx.channelId },
            order: { updatedAt: 'DESC' },
        });
        return rows.map((r) => this.cardEntityToDto(r));
    }

    async createContentCard(
        ctx: RequestContext,
        input: Omit<ContentStrategyCardDto, 'id' | 'createdAt' | 'updatedAt'>,
    ): Promise<ContentStrategyCardDto> {
        const repo = this.connection.getRepository(ctx, ContentStrategyCard);
        const channel = ctx.channel;
        if (!channel) throw new Error('No active channel');
        const row = repo.create({
            channelId: channel.id,
            channel,
            title: input.title,
            platform: input.platform,
            contentType: input.contentType,
            hook: input.hook ?? null,
            keyMessage: input.keyMessage ?? null,
            cta: input.cta ?? null,
            relatedPillar: input.relatedPillar ?? null,
            goal: input.goal ?? null,
            campaign: input.campaign ?? null,
            status: input.status,
            scheduledFor: input.scheduledFor ?? null,
        });
        const saved = await repo.save(row);
        return this.cardEntityToDto(saved);
    }

    async updateContentCard(
        ctx: RequestContext,
        id: string,
        updates: Partial<Omit<ContentStrategyCardDto, 'id' | 'createdAt' | 'updatedAt'>>,
    ): Promise<ContentStrategyCardDto | null> {
        const repo = this.connection.getRepository(ctx, ContentStrategyCard);
        const row = await repo.findOne({
            where: { id: id as any, channelId: ctx.channelId },
        });
        if (!row) return null;
        if (updates.title != null) row.title = updates.title;
        if (updates.platform != null) row.platform = updates.platform;
        if (updates.contentType != null) row.contentType = updates.contentType;
        if (updates.hook !== undefined) row.hook = updates.hook ?? null;
        if (updates.keyMessage !== undefined) row.keyMessage = updates.keyMessage ?? null;
        if (updates.cta !== undefined) row.cta = updates.cta ?? null;
        if (updates.relatedPillar !== undefined) row.relatedPillar = updates.relatedPillar ?? null;
        if (updates.goal !== undefined) row.goal = updates.goal ?? null;
        if (updates.campaign !== undefined) row.campaign = updates.campaign ?? null;
        if (updates.status != null) row.status = updates.status;
        if (updates.scheduledFor !== undefined) row.scheduledFor = updates.scheduledFor ?? null;
        const saved = await repo.save(row);
        return this.cardEntityToDto(saved);
    }

    async deleteContentCard(ctx: RequestContext, id: string): Promise<boolean> {
        const repo = this.connection.getRepository(ctx, ContentStrategyCard);
        const result = await repo.delete({ id: id as any, channelId: ctx.channelId });
        return (result.affected ?? 0) > 0;
    }

    private brandEntityToDto(row: ContentStrategyBrandProfile): ContentStrategyBrandProfileDto {
        return {
            brandName: row.brandName,
            targetAudience: row.targetAudience,
            brandTone: row.brandTone,
            contentGoals: row.contentGoals ?? [],
            primaryPlatforms: row.primaryPlatforms ?? [],
            contentPillars: row.contentPillars ?? [],
            campaigns: row.campaigns ?? undefined,
            schemaVersion: row.schemaVersion,
            updatedAt: row.updatedAt?.toISOString(),
        };
    }

    private cardEntityToDto(row: ContentStrategyCard): ContentStrategyCardDto {
        return {
            id: String(row.id),
            title: row.title,
            platform: row.platform,
            contentType: row.contentType,
            hook: row.hook ?? undefined,
            keyMessage: row.keyMessage ?? undefined,
            cta: row.cta ?? undefined,
            relatedPillar: row.relatedPillar ?? undefined,
            goal: row.goal ?? undefined,
            campaign: row.campaign ?? undefined,
            status: row.status,
            createdAt: row.createdAt.toISOString(),
            updatedAt: row.updatedAt.toISOString(),
            scheduledFor: row.scheduledFor ?? undefined,
        };
    }
}
