import type { UserEntity } from '../../domain/entities/user.entity.js';

type ImmutableFields = 'id' | 'tokenVersion' | 'createdAt' | 'updatedAt';
export type CreateUserData = Omit<UserEntity, ImmutableFields>;
export type UpdateUserData = Partial<Omit<UserEntity, ImmutableFields>>;
