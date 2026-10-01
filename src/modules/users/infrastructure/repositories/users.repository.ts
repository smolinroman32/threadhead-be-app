import { Injectable } from '@nestjs/common';
import type { IUserRepository } from './user.repositroy.interface.js';
import { PrismaService } from '../../../../shared/prisma.service.js';
import { UserMapper } from '../mappers/user.mapper.js';
import { UserNotFoundError } from '../../domain/errors/user-not-found-error.js';

@Injectable()
export class UserRepository implements IUserRepository {
    constructor(private prisma: PrismaService) {}

    async getUserById(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) throw new UserNotFoundError(userId);

        return UserMapper.toDomain(user);
    }
}
