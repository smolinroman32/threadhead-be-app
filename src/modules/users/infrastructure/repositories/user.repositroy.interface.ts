import type { UserEntity } from '../../domain/entities/user.entity.js';

export type CreateUserDateBody = Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUserDataBody = Partial<Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>>;
export interface IUserRepository {
    getUserById: (userId: string) => Promise<UserEntity>;
    deleteUserById: (userId: string) => Promise<UserEntity>;
    updateUserById: (userId: string, userData: UpdateUserDataBody) => Promise<UserEntity>;
    createUser: (userData: CreateUserDateBody) => Promise<UserEntity>;
}
