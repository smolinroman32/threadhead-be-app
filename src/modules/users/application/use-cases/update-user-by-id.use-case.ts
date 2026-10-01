import { Injectable } from '@nestjs/common';
import type { UpdateUserDataBody } from '../../infrastructure/repositories/user.repositroy.interface.js';
import { UserRepository } from '../../infrastructure/repositories/users.repository.js';

@Injectable()
export class UpdateUserByIdUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    execute(userId: string, userData: UpdateUserDataBody) {
        return this.userRepository.updateUserById(userId, userData);
    }
}
