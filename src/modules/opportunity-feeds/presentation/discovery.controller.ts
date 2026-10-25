import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { StrictBodyPipe } from '../../../shared/validation/strict-body.pipe.js';
import type { JwtPayload } from '../../auth/domain/jwt-payload.js';
import { CurrentUser } from '../../auth/presentation/decorators/current-user.decorator.js';
import { OpportunityFeedsService } from '../application/opportunity-feeds.service.js';
import type { OpportunityStatus, ReviewStatus } from '../domain/entities/opportunity.entity.js';
import { ChangeOpportunityStatusDto } from './dto/change-opportunity-status.dto.js';
import { ListOpportunitiesQueryDto } from './dto/list-opportunities-query.dto.js';
import type {
    OpportunityCountsResponseDto,
    OpportunityListResponseDto,
} from './dto/opportunity-response.dto.js';
import { DiscoveryResponseMapper } from './mappers/discovery-response.mapper.js';

@Controller()
export class DiscoveryController {
    constructor(private readonly feedsService: OpportunityFeedsService) {}

    @Post('opportunity-feeds/:feedId/discovery-runs')
    @HttpCode(HttpStatus.ACCEPTED)
    async requestRun(@CurrentUser() currentUser: JwtPayload, @Param('feedId', ParseUUIDPipe) feedId: string) {
        const { run, nextRunAt } = await this.feedsService.requestRun(currentUser.sub, feedId);

        return DiscoveryResponseMapper.run(run, nextRunAt);
    }

    @Get('opportunity-feeds/:feedId/discovery-runs/latest')
    async latestRun(@CurrentUser() currentUser: JwtPayload, @Param('feedId', ParseUUIDPipe) feedId: string) {
        const { run, nextRunAt } = await this.feedsService.getRun(currentUser.sub, feedId, 'latest');

        return DiscoveryResponseMapper.run(run, nextRunAt);
    }

    @Get('opportunity-feeds/:feedId/discovery-runs/:runId')
    async getRun(
        @CurrentUser() currentUser: JwtPayload,
        @Param('feedId', ParseUUIDPipe) feedId: string,
        @Param('runId', ParseUUIDPipe) runId: string,
    ) {
        const { run, nextRunAt } = await this.feedsService.getRun(currentUser.sub, feedId, runId);

        return DiscoveryResponseMapper.run(run, nextRunAt);
    }

    @Get('opportunity-feeds/:feedId/opportunities')
    async listOpportunities(
        @CurrentUser() currentUser: JwtPayload,
        @Param('feedId', ParseUUIDPipe) feedId: string,
        @Query() query: ListOpportunitiesQueryDto,
    ): Promise<OpportunityListResponseDto> {
        const { items, total, page, pageSize } = await this.feedsService.listOpportunities(
            currentUser.sub,
            feedId,
            (query.status ?? 'new').toUpperCase() as OpportunityStatus,
            query.page ?? 1,
        );

        return { items: items.map(DiscoveryResponseMapper.opportunity), total, page, pageSize };
    }

    @Get('opportunity-feeds/:feedId/opportunity-counts')
    countOpportunities(
        @CurrentUser() currentUser: JwtPayload,
        @Param('feedId', ParseUUIDPipe) feedId: string,
    ): Promise<OpportunityCountsResponseDto> {
        return this.feedsService.countOpportunities(currentUser.sub, feedId);
    }

    @Patch('opportunities/:id')
    async changeStatus(
        @CurrentUser() currentUser: JwtPayload,
        @Param('id', ParseUUIDPipe) id: string,
        @Body(new StrictBodyPipe(ChangeOpportunityStatusDto))
        body: Pick<ChangeOpportunityStatusDto, 'status'>,
    ) {
        const opportunity = await this.feedsService.changeOpportunityStatus(
            currentUser.sub,
            id,
            body.status.toUpperCase() as ReviewStatus,
        );

        return DiscoveryResponseMapper.opportunity(opportunity);
    }
}
