import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
} from '@nestjs/common';
import { StrictBodyPipe } from '../../../shared/validation/strict-body.pipe.js';
import type { JwtPayload } from '../../auth/domain/jwt-payload.js';
import { CurrentUser } from '../../auth/presentation/decorators/current-user.decorator.js';
import { OpportunityFeedsService } from '../application/opportunity-feeds.service.js';
import type {
    NewOpportunityFeedInput,
    OpportunityFeedChanges,
} from '../domain/entities/opportunity-feed-fields.js';
import { CreateOpportunityFeedDto } from './dto/create-opportunity-feed.dto.js';
import { UpdateOpportunityFeedDto } from './dto/update-opportunity-feed.dto.js';
import { OpportunityFeedResponseMapper } from './mappers/opportunity-feed-response.mapper.js';

@Controller('opportunity-feeds')
export class OpportunityFeedsController {
    constructor(private readonly feedsService: OpportunityFeedsService) {}

    @Post()
    async create(
        @CurrentUser() currentUser: JwtPayload,
        @Body(new StrictBodyPipe(CreateOpportunityFeedDto)) input: NewOpportunityFeedInput,
    ) {
        const feed = await this.feedsService.create(currentUser.sub, input);

        return OpportunityFeedResponseMapper.toDto(feed);
    }

    @Get()
    async list(@CurrentUser() currentUser: JwtPayload) {
        const feeds = await this.feedsService.list(currentUser.sub);

        return feeds.map(OpportunityFeedResponseMapper.toDto);
    }

    @Get(':id')
    async get(@CurrentUser() currentUser: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
        const feed = await this.feedsService.get(currentUser.sub, id);

        return OpportunityFeedResponseMapper.toDto(feed);
    }

    @Patch(':id')
    async update(
        @CurrentUser() currentUser: JwtPayload,
        @Param('id', ParseUUIDPipe) id: string,
        @Body(new StrictBodyPipe(UpdateOpportunityFeedDto)) changes: OpportunityFeedChanges,
    ) {
        const feed = await this.feedsService.update(currentUser.sub, id, changes);

        return OpportunityFeedResponseMapper.toDto(feed);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@CurrentUser() currentUser: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
        await this.feedsService.delete(currentUser.sub, id);
    }
}
