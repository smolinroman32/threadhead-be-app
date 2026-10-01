import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { UserService } from '../application/user.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserResponseMapper } from './mappers/user-response.mapper.js';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UserService) {}

    @Get(':id')
    async getUserById(@Param('id', ParseUUIDPipe) id: string) {
        const user = await this.userService.getUserById(id);

        return UserResponseMapper.toDto(user);
    }

    @Patch(':id')
    async updateUserById(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateUserDto) {
        const { name, age, email } = body;
        const user = await this.userService.updateUserById(id, { name, age, email });

        return UserResponseMapper.toDto(user);
    }

    @Delete(':id')
    async deleteUserById(@Param('id', ParseUUIDPipe) id: string) {
        const user = await this.userService.deleteUserById(id);

        return UserResponseMapper.toDto(user);
    }
}
