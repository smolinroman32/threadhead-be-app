import { Injectable } from '@nestjs/common';
import type { CreateUserData } from '../../domain/ports/user-repository.port.js';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port.js';

@Injectable()
export class CreateUserUseCase {
    constructor(private readonly userRepository: UserRepositoryPort) {}

    execute(userData: CreateUserData) {
        return this.userRepository.createUser(userData);
    }
}
