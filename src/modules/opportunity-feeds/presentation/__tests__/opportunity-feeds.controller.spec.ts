import type { JwtPayload } from '../../../auth/domain/jwt-payload.js';
import type { OpportunityFeedsService } from '../../application/opportunity-feeds.service.js';
import { OpportunityFeedEntity } from '../../domain/entities/opportunity-feed.entity.js';
import { OpportunityFeedsController } from '../opportunity-feeds.controller.js';

const entity = new OpportunityFeedEntity('feed-id', {
    userId: 'user-id',
    name: 'AI agents',
    intent: 'Find people asking about AI agents',
    targetAudience: 'Founders',
    includeTerms: ['ai agents'],
    excludeTerms: [],
    languages: ['en'],
    freshnessHours: 24,
    minScore: 60,
    isActive: true,
    createdAt: new Date('2026-10-14'),
    updatedAt: new Date('2026-10-15'),
});

const expected = {
    id: 'feed-id',
    name: 'AI agents',
    intent: 'Find people asking about AI agents',
    targetAudience: 'Founders',
    includeTerms: ['ai agents'],
    excludeTerms: [],
    languages: ['en'],
    freshnessHours: 24,
    minScore: 60,
    isActive: true,
    createdAt: new Date('2026-10-14'),
    updatedAt: new Date('2026-10-15'),
};

describe('OpportunityFeedsController', () => {
    const currentUser: JwtPayload = { sub: 'user-id', email: 'u@x.io', tokenVersion: 0 };
    const service = { create: vi.fn(), list: vi.fn(), get: vi.fn(), update: vi.fn(), delete: vi.fn() };
    const controller = new OpportunityFeedsController(service as unknown as OpportunityFeedsService);

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('create passes the token user and returns the feed without internal fields', async () => {
        const input = {
            name: 'AI agents',
            intent: 'Find people asking about AI agents',
            targetAudience: 'Founders',
            includeTerms: ['ai agents'],
        };
        service.create.mockResolvedValue(entity);

        await expect(controller.create(currentUser, input)).resolves.toEqual(expected);
        expect(service.create).toHaveBeenCalledWith('user-id', input);
    });

    it('list maps every feed of the token user', async () => {
        service.list.mockResolvedValue([entity]);

        await expect(controller.list(currentUser)).resolves.toEqual([expected]);
        expect(service.list).toHaveBeenCalledWith('user-id');
    });

    it('get, update and delete scope the call to the token user', async () => {
        service.get.mockResolvedValue(entity);
        service.update.mockResolvedValue(entity);

        await expect(controller.get(currentUser, 'feed-id')).resolves.toEqual(expected);
        await expect(controller.update(currentUser, 'feed-id', { minScore: 80 })).resolves.toEqual(expected);
        await controller.remove(currentUser, 'feed-id');

        expect(service.get).toHaveBeenCalledWith('user-id', 'feed-id');
        expect(service.update).toHaveBeenCalledWith('user-id', 'feed-id', { minScore: 80 });
        expect(service.delete).toHaveBeenCalledWith('user-id', 'feed-id');
    });
});
