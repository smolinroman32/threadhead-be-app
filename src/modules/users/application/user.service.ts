import { Injectable } from '@nestjs/common';
import type {
    CreateUserDateBody,
    UpdateUserDataBody,
} from '../infrastructure/repositories/user.repositroy.interface.js';
import { CreateUserUseCase } from './use-cases/create-user.use-case.js';
import { DeleteUserByIdUseCase } from './use-cases/delete-user-by-id.use-case.js';
import { GetUserByEmailUseCase } from './use-cases/get-user-by-email.use-case.js';
import { GetUserByIdUseCase } from './use-cases/get-user-by-id.use-case.js';
import { UpdateUserByIdUseCase } from './use-cases/update-user-by-id.use-case.js';

@Injectable()
export class UserService {
    constructor(
        private readonly createUserUseCase: CreateUserUseCase,
        private readonly deleteUserByIdUseCase: DeleteUserByIdUseCase,
        private readonly getUserByIdUseCase: GetUserByIdUseCase,
        private readonly getUserByEmailUseCase: GetUserByEmailUseCase,
        private readonly updateUserByIdUseCase: UpdateUserByIdUseCase,
    ) {}

    createUser(userData: CreateUserDateBody) {
        return this.createUserUseCase.execute(userData);
    }

    deleteUserById(userId: string) {
        return this.deleteUserByIdUseCase.execute(userId);
    }

    getUserById(userId: string) {
        return this.getUserByIdUseCase.execute(userId);
    }

    getUserByEmail(email: string) {
        return this.getUserByEmailUseCase.execute(email);
    }

    updateUserById(userId: string, userData: UpdateUserDataBody) {
        return this.updateUserByIdUseCase.execute(userId, userData);
    }
}
