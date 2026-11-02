import { IsString } from 'class-validator';

export class ReplyToOpportunityDto {
    @IsString()
    text: string;
}
