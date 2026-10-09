import { Injectable } from '@nestjs/common';
import type { CreateUserData } from '../../infrastructure/repositories/user-repository.types.js';
import { UserRepository } from '../../infrastructure/repositories/users.repository.js';

@Injectable()
export class CreateUserUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    execute(userData: CreateUserData) {
        return this.userRepository.createUser(userData);
    }
}
