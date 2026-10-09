import { Injectable } from '@nestjs/common';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port.js';

@Injectable()
export class RevokeUserSessionsUseCase {
    constructor(private readonly userRepository: UserRepositoryPort) {}

    execute(userId: string) {
        return this.userRepository.revokeSessions(userId);
    }
}
