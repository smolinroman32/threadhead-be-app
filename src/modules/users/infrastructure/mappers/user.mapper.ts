import { User } from '../../../../generated/prisma/client.js';
import { UserEntity } from '../../domain/entities/user.entity.js';

export class UserMapper {
    static toDomain(raw: User): UserEntity {
        return new UserEntity(raw.id, {
            name: raw.name,
            email: raw.email,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
            passwordHash: raw.passwordHash,
            tokenVersion: raw.tokenVersion,
        });
    }
}
