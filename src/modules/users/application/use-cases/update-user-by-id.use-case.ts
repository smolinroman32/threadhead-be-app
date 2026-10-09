import { Injectable } from '@nestjs/common';
import type { UpdateUserData } from '../../infrastructure/repositories/user-repository.interface.js';
import { UserRepository } from '../../infrastructure/repositories/users.repository.js';

@Injectable()
export class UpdateUserByIdUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    execute(userId: string, userData: UpdateUserData) {
        return this.userRepository.updateUserById(userId, userData);
    }
}
