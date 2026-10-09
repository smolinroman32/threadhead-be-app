import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../infrastructure/repositories/users.repository.js';

@Injectable()
export class RevokeUserSessionsUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    execute(userId: string) {
        return this.userRepository.revokeSessions(userId);
    }
}
