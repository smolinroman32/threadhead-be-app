import { Injectable } from '@nestjs/common';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port.js';

@Injectable()
export class GetUserByEmailUseCase {
    constructor(private readonly userRepository: UserRepositoryPort) {}

    execute(email: string) {
        return this.userRepository.getUserByEmail(email);
    }
}
