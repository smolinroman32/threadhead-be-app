import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../infrastructure/repositories/users.repository.js';

@Injectable()
export class GetUserByEmailUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    execute(email: string) {
        return this.userRepository.getUserByEmail(email);
    }
}
