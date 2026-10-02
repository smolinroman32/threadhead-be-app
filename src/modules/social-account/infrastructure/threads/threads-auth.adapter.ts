import { SocialAuthPort } from "../../application/ports/social-auth.port.js";

export class ThreadsAuthAdapter extends SocialAuthPort {
    constructor() {
        super();
    }

    getAuthorizationUrl(state: string): string {
        throw new Error("Method not implemented.");
    }

    exchangeCode(code: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    refreshToken(refreshToken: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}