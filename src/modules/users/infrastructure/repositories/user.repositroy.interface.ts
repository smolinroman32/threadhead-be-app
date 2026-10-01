import type { UserEntity } from '../../domain/entities/user.entity.js';

export interface IUserRepository {
    getUserById: (userId: string) => Promise<UserEntity>;
}
