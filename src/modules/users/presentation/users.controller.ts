import { Body, Controller, Delete, Get, Patch } from '@nestjs/common';
import type { JwtPayload } from '../../auth/domain/jwt-payload.js';
import { CurrentUser } from '../../auth/presentation/decorators/current-user.decorator.js';
import { UserService } from '../application/user.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserResponseMapper } from './mappers/user-response.mapper.js';

// The user id always comes from the access token, never from the URL or body.
@Controller('users')
export class UsersController {
    constructor(private readonly userService: UserService) {}

    @Get('me')
    async getMe(@CurrentUser() currentUser: JwtPayload) {
        const user = await this.userService.getUserById(currentUser.sub);

        return UserResponseMapper.toDto(user);
    }

    @Patch('me')
    async updateMe(@CurrentUser() currentUser: JwtPayload, @Body() body: UpdateUserDto) {
        const { name, age, email } = body;
        const user = await this.userService.updateUserById(currentUser.sub, { name, age, email });

        return UserResponseMapper.toDto(user);
    }

    @Delete('me')
    async deleteMe(@CurrentUser() currentUser: JwtPayload) {
        const user = await this.userService.deleteUserById(currentUser.sub);

        return UserResponseMapper.toDto(user);
    }
}
