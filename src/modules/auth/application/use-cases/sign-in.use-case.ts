import { Injectable } from '@nestjs/common';
import { UserService } from '../../../users/application/user.service.js';
import { CredentialsService } from '../../../../shared/credential-service/credential.service.js';
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error.js';

export type SignInInput = {
    email: string;
    password: string;
};

@Injectable()
export class SignInUseCase {
    constructor(
        private readonly userService: UserService,
        private readonly credentialsService: CredentialsService,
    ) {}

    async execute({ email, password }: SignInInput) {
        const user = await this.userService.getUserByEmail(email);

        const isPasswordValid = await this.credentialsService.checkPassword(password, user?.passwordHash);

        if (!user || !isPasswordValid) throw new InvalidCredentialsError();

        return user;
    }
}
