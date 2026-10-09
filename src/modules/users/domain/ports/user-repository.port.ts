import type { UserEntity } from '../entities/user.entity.js';

type ImmutableFields = 'id' | 'tokenVersion' | 'createdAt' | 'updatedAt';
export type CreateUserData = Omit<UserEntity, ImmutableFields>;
export type UpdateUserData = Partial<Omit<UserEntity, ImmutableFields>>;

export abstract class UserRepositoryPort {
    abstract getUserById(userId: string): Promise<UserEntity>;
    abstract getUserByEmail(email: string): Promise<UserEntity | null>;
    abstract deleteUserById(userId: string): Promise<UserEntity>;
    abstract updateUserById(userId: string, userData: UpdateUserData): Promise<UserEntity>;
    abstract revokeSessions(userId: string): Promise<void>;
    abstract createUser(userData: CreateUserData): Promise<UserEntity>;
}
