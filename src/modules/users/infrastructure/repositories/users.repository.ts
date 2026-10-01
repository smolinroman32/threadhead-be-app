import { Injectable } from '@nestjs/common';
import type { CreateUserDateBody, IUserRepository, UpdateUserDataBody } from './user.repositroy.interface.js';
import { PrismaService } from '../../../../shared/prisma.service.js';
import { UserMapper } from '../mappers/user.mapper.js';

@Injectable()
export class UserRepository implements IUserRepository {
    constructor(private prisma: PrismaService) {}

    async getUserById(userId: string) {
        const user = await this.prisma.user.findUniqueOrThrow({
            where: { id: userId },
        });

        return UserMapper.toDomain(user);
    }

    async deleteUserById(userId: string) {
        const user = await this.prisma.user.delete({
            where: { id: userId },
        });

        return UserMapper.toDomain(user);
    }

    async updateUserById(userId: string, userData: UpdateUserDataBody) {
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

    async createUser(userData: CreateUserDateBody) {
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

    async getUserByEmail(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) return null;

        return UserMapper.toDomain(user);
    }
}
