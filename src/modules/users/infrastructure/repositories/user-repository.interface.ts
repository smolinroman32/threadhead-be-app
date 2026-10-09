import type { UserEntity } from '../../domain/entities/user.entity.js';

type ImmutableFields = 'id' | 'tokenVersion' | 'createdAt' | 'updatedAt';
export type CreateUserData = Omit<UserEntity, ImmutableFields>;
export type UpdateUserData = Partial<Omit<UserEntity, ImmutableFields>>;

// Checked by `implements` in UserRepository, so a missing or mistyped method fails the build.
export interface IUserRepository {
    getUserById: (userId: string) => Promise<UserEntity>;
    getUserByEmail: (email: string) => Promise<UserEntity | null>;
    deleteUserById: (userId: string) => Promise<UserEntity>;
    updateUserById: (userId: string, userData: UpdateUserData) => Promise<UserEntity>;
    revokeSessions: (userId: string) => Promise<void>;
    createUser: (userData: CreateUserData) => Promise<UserEntity>;
}
