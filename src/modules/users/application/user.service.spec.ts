import type { UserRepository } from '../infrastructure/repositories/users.repository.js';
import { UserService } from './user.service.js';
import { CreateUserUseCase } from './use-cases/create-user.use-case.js';
import { DeleteUserByIdUseCase } from './use-cases/delete-user-by-id.use-case.js';
import { GetUserByEmailUseCase } from './use-cases/get-user-by-email.use-case.js';
import { GetUserByIdUseCase } from './use-cases/get-user-by-id.use-case.js';
import { UpdateUserByIdUseCase } from './use-cases/update-user-by-id.use-case.js';

describe('UserService', () => {
    const repository = {
        createUser: vi.fn(),
        deleteUserById: vi.fn(),
        getUserById: vi.fn(),
        getUserByEmail: vi.fn(),
        updateUserById: vi.fn(),
    } as unknown as UserRepository;
    const service = new UserService(
        new CreateUserUseCase(repository),
        new DeleteUserByIdUseCase(repository),
        new GetUserByIdUseCase(repository),
        new GetUserByEmailUseCase(repository),
        new UpdateUserByIdUseCase(repository),
    );

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('delegates each operation to its use case and repository', () => {
        const userId = 'user-id';
        
        const userData = {
            name: 'Jane Doe',
            age: 25,
            email: 'jane@example.com',
            passwordHash: 'hash',
        };

        service.createUser(userData);
        service.deleteUserById(userId);
        service.getUserById(userId);
        service.getUserByEmail(userData.email);
        service.updateUserById(userId, { name: userData.name });

        expect(repository.createUser).toHaveBeenCalledWith(userData);
        expect(repository.deleteUserById).toHaveBeenCalledWith(userId);
        expect(repository.getUserById).toHaveBeenCalledWith(userId);
        expect(repository.getUserByEmail).toHaveBeenCalledWith(userData.email);
        expect(repository.updateUserById).toHaveBeenCalledWith(userId, { name: userData.name });
    });
});
