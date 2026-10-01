import type { UserEntity } from '../../domain/entities/user.entity.js';
import type { UserResponseDto } from '../dto/user-response.dto.js';

export class UserResponseMapper {
    static toDto(user: UserEntity): UserResponseDto {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            age: user.age,
            createdAt: user.createdAt,
        };
    }
}
