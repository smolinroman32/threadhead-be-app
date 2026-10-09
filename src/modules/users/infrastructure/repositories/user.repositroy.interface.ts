import type { UserEntity } from '../../domain/entities/user.entity.js';

type ImmutableFields = 'id' | 'tokenVersion' | 'createdAt' | 'updatedAt';
export type CreateUserDateBody = Omit<UserEntity, ImmutableFields>;
export type UpdateUserDataBody = Partial<Omit<UserEntity, ImmutableFields>>;
export interface IUserRepository {
    getUserById: (userId: string) => Promise<UserEntity>;
    getUserByEmail: (email: string) => Promise<UserEntity | null>;
    deleteUserById: (userId: string) => Promise<UserEntity>;
    updateUserById: (userId: string, userData: UpdateUserDataBody) => Promise<UserEntity>;
    revokeSessions: (userId: string) => Promise<void>;
    createUser: (userData: CreateUserDateBody) => Promise<UserEntity>;
}
