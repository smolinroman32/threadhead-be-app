import { Injectable } from '@nestjs/common';
import type { CreateUserDateBody } from '../../infrastructure/repositories/user.repositroy.interface.js';
import { UserRepository } from '../../infrastructure/repositories/users.repository.js';

@Injectable()
export class CreateUserUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    execute(userData: CreateUserDateBody) {
        return this.userRepository.createUser(userData);
    }
}
