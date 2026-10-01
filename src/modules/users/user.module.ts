import { Module } from '@nestjs/common';
import { UserService } from './application/user.service.js';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case.js';
import { DeleteUserByIdUseCase } from './application/use-cases/delete-user-by-id.use-case.js';
import { GetUserByEmailUseCase } from './application/use-cases/get-user-by-email.use-case.js';
import { GetUserByIdUseCase } from './application/use-cases/get-user-by-id.use-case.js';
import { UpdateUserByIdUseCase } from './application/use-cases/update-user-by-id.use-case.js';
import { UserRepository } from './infrastructure/repositories/users.repository.js';
import { UsersController } from './presentation/users.controller.js';
import { PrismaService } from '../../shared/prisma.service.js';

@Module({
    controllers: [UsersController],
    providers: [
        PrismaService,
        UserRepository,
        CreateUserUseCase,
        DeleteUserByIdUseCase,
        GetUserByIdUseCase,
        GetUserByEmailUseCase,
        UpdateUserByIdUseCase,
        UserService,
    ],
    exports: [UserService],
})
export class UsersModule {}
