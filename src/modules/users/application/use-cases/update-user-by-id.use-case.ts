import { Injectable } from '@nestjs/common';
import type { UpdateUserData } from '../../domain/ports/user-repository.port.js';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port.js';

@Injectable()
export class UpdateUserByIdUseCase {
    constructor(private readonly userRepository: UserRepositoryPort) {}

    execute(userId: string, userData: UpdateUserData) {
        return this.userRepository.updateUserById(userId, userData);
    }
}
