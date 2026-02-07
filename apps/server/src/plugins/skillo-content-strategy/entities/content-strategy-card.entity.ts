import type { DeepPartial } from '@vendure/common/lib/shared-types';
import { Channel, EntityId, ID, VendureEntity } from '@vendure/core';
import { Column, Entity, ManyToOne } from 'typeorm';

/**
 * Content Strategy card (content idea) per channel (DB entity).
 */
@Entity()
export class ContentStrategyCard extends VendureEntity {
    constructor(input?: DeepPartial<ContentStrategyCard>) {
        super(input);
    }

    @ManyToOne(() => Channel, { onDelete: 'CASCADE' })
    channel: Channel;

    @EntityId()
    channelId: ID;

    @Column()
    title: string;

    @Column({ type: 'varchar', length: 32 })
    platform: string;

    @Column({ type: 'varchar', length: 32 })
    contentType: string;

    @Column({ type: 'text', nullable: true })
    hook: string | null;

    @Column({ type: 'text', nullable: true })
    keyMessage: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    cta: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    relatedPillar: string | null;

    @Column({ type: 'varchar', length: 32, nullable: true })
    goal: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    campaign: string | null;

    @Column({ type: 'varchar', length: 32 })
    status: string;

    @Column({ type: 'varchar', length: 64, nullable: true })
    scheduledFor: string | null;
}
