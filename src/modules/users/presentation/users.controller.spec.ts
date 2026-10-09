import 'reflect-metadata';
import { PATH_METADATA } from '@nestjs/common/constants.js';
import type { Response } from 'express';
import type { JwtPayload } from '../../auth/domain/jwt-payload.js';
import type { UserService } from '../application/user.service.js';
import { UserEntity } from '../domain/entities/user.entity.js';
import { UsersController } from './users.controller.js';

describe('UsersController', () => {
    const currentUser: JwtPayload = { sub: 'token-user-id', email: 'me@example.com', tokenVersion: 0 };
    const entity = new UserEntity(currentUser.sub, {
        name: 'Me',
        age: 30,
        email: currentUser.email,
        passwordHash: 'secret-hash',
        tokenVersion: 0,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-02'),
    });
    const userService = {
        getUserById: vi.fn(),
        updateUserById: vi.fn(),
        deleteUserById: vi.fn(),
    };
    const controller = new UsersController(userService as unknown as UserService);
    const response = { clearCookie: vi.fn() };
    const res = response as unknown as Response;

    beforeEach(() => {
        vi.resetAllMocks();
        userService.getUserById.mockResolvedValue(entity);
        userService.updateUserById.mockResolvedValue(entity);
        userService.deleteUserById.mockResolvedValue(entity);
    });

    it('returns the token user without exposing the password hash', async () => {
        const result = await controller.getMe(currentUser);

        expect(userService.getUserById).toHaveBeenCalledWith(currentUser.sub);
        expect(result).toEqual({
            id: currentUser.sub,
            name: 'Me',
            email: currentUser.email,
            age: 30,
            createdAt: entity.createdAt,
        });
    });

    it('updates only the token user', async () => {
        await controller.updateMe(currentUser, { name: 'New', age: 31 });

        expect(userService.updateUserById).toHaveBeenCalledWith(currentUser.sub, {
            name: 'New',
            age: 31,
            email: undefined,
        });
    });

    it('deletes only the token user', async () => {
        await controller.deleteMe(currentUser, res);

        expect(userService.deleteUserById).toHaveBeenCalledWith(currentUser.sub);
    });

    it('clears the auth cookies when the account is deleted', async () => {
        await controller.deleteMe(currentUser, res);

        expect(response.clearCookie).toHaveBeenCalledWith('access_token', expect.objectContaining({ path: '/' }));
        expect(response.clearCookie).toHaveBeenCalledWith('refresh_token', expect.objectContaining({ path: '/auth' }));
    });

    it('has no route that takes a user id from the request', () => {
        const paths = Object.getOwnPropertyNames(UsersController.prototype)
            .filter((name) => name !== 'constructor')
            .map((name) => Reflect.getMetadata(PATH_METADATA, UsersController.prototype[name as keyof UsersController]));

        expect(paths.length).toBeGreaterThan(0);
        expect(paths.every((path) => !String(path).includes(':'))).toBe(true);
    });
});
