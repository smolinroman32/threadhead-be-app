import { Injectable } from '@nestjs/common';
import { UserService } from '../../../users/application/user.service.js';
import { UserEmailTakenError } from '../../../users/domain/errors/user-email-taken.error.js';
import { CredentialsService } from '../../../../shared/credential-service/credential.service.js';

export type SignUpInput = {
    name: string;
    age: number;
    email: string;
    password: string;
};

@Injectable()
export class SignUpUseCase {
    constructor(
        private readonly userService: UserService,
        private readonly credentialsService: CredentialsService,
    ) {}

    async execute({ name, age, email, password }: SignUpInput) {
        const existingUser = await this.userService.getUserByEmail(email);

        if (existingUser) throw new UserEmailTakenError(email);

        const passwordHash = await this.credentialsService.hashPassword(password);

        return this.userService.createUser({ name, age, email, passwordHash });
    }
}
