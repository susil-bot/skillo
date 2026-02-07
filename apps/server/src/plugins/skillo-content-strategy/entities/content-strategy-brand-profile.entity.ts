import type { DeepPartial } from '@vendure/common/lib/shared-types';
import { Channel, EntityId, ID, VendureEntity } from '@vendure/core';
import { Column, Entity, ManyToOne } from 'typeorm';

/**
 * Content Strategy brand profile per channel (DB entity).
 * JSON columns store arrays; enums stored as strings.
 */
@Entity()
export class ContentStrategyBrandProfile extends VendureEntity {
    constructor(input?: DeepPartial<ContentStrategyBrandProfile>) {
        super(input);
    }

    @ManyToOne(() => Channel, { onDelete: 'CASCADE' })
    channel: Channel;

    @EntityId()
    channelId: ID;

    @Column()
    brandName: string;

    @Column()
    targetAudience: string;

    @Column({ type: 'varchar', length: 32 })
    brandTone: string;

    @Column({ type: 'jsonb', default: [] })
    contentGoals: string[];

    @Column({ type: 'jsonb', default: [] })
    primaryPlatforms: string[];

    @Column({ type: 'jsonb', default: [] })
    contentPillars: string[];

    @Column({ type: 'jsonb', nullable: true })
    campaigns: string[] | null;

    @Column({ type: 'int', default: 1 })
    schemaVersion: number;
}
