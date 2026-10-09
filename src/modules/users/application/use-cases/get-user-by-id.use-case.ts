import { Injectable } from '@nestjs/common';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port.js';

@Injectable()
export class GetUserByIdUseCase {
    constructor(private readonly userRepository: UserRepositoryPort) {}

    execute(userId: string) {
        return this.userRepository.getUserById(userId);
    }
}
