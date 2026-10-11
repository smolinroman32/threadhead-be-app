import { SocialAccountsService } from './social-accounts.service.js';
import type { AuthorizeSocialAccountUseCase } from './use-cases/authorize-social-account.use-case.js';
import type { ConnectSocialAccountUseCase } from './use-cases/connect-social-account.use-case.js';
import type { DisconnectSocialAccountUseCase } from './use-cases/disconnect-social-account.use-case.js';
import type { GetAccessTokenUseCase } from './use-cases/get-access-token.use-case.js';
import type { ListSocialAccountsUseCase } from './use-cases/list-social-accounts.use-case.js';

describe('SocialAccountsService', () => {
    const useCase = () => ({ execute: vi.fn() });
    const authorize = useCase();
    const connect = useCase();
    const list = useCase();
    const disconnect = useCase();
    const getAccessToken = useCase();
    const service = new SocialAccountsService(
        authorize as unknown as AuthorizeSocialAccountUseCase,
        connect as unknown as ConnectSocialAccountUseCase,
        list as unknown as ListSocialAccountsUseCase,
        disconnect as unknown as DisconnectSocialAccountUseCase,
        getAccessToken as unknown as GetAccessTokenUseCase,
    );

    it('delegates each operation to its use case', () => {
        const input = { state: 's', code: 'c', currentUserId: 'user-id' };

        service.authorize('user-id', 'THREADS');
        service.connect(input);
        service.list('user-id');
        service.disconnect('user-id', 'account-id');
        service.getAccessToken('account-id');

        expect(authorize.execute).toHaveBeenCalledWith('user-id', 'THREADS');
        expect(connect.execute).toHaveBeenCalledWith(input);
        expect(list.execute).toHaveBeenCalledWith('user-id');
        expect(disconnect.execute).toHaveBeenCalledWith('user-id', 'account-id');
        expect(getAccessToken.execute).toHaveBeenCalledWith('account-id');
    });
});
