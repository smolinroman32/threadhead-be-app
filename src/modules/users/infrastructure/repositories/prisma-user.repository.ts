import { Injectable } from '@nestjs/common';
import {
    UserRepositoryPort,
    type CreateUserData,
    type UpdateUserData,
} from '../../domain/ports/user-repository.port.js';
import { PrismaService } from '../../../../shared/prisma.service.js';
import { UserNotFoundError } from '../../domain/errors/user-not-found.error.js';
import { UserMapper } from '../mappers/user.mapper.js';

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
    constructor(private prisma: PrismaService) {}

    async getUserById(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) throw new UserNotFoundError(userId);

        return UserMapper.toDomain(user);
    }

    async deleteUserById(userId: string) {
        const user = await this.prisma.user.delete({
            where: { id: userId },
        });

        return UserMapper.toDomain(user);
    }

    async updateUserById(userId: string, userData: UpdateUserData) {
        const user = await this.prisma.user.update({
            data: {
                name: userData.name,
                email: userData.email,
                passwordHash: userData.passwordHash,
                age: userData.age,
            },
            where: { id: userId },
        });

        return UserMapper.toDomain(user);
    }

    async createUser(userData: CreateUserData) {
        const user = await this.prisma.user.create({
            data: {
                name: userData.name,
                email: userData.email,
                passwordHash: userData.passwordHash,
                age: userData.age,
            },
        });

        return UserMapper.toDomain(user);
    }

    async revokeSessions(userId: string) {
        await this.prisma.user.updateMany({
            where: { id: userId },
            data: { tokenVersion: { increment: 1 } },
        });
    }

    async getUserByEmail(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) return null;

        return UserMapper.toDomain(user);
    }
}
