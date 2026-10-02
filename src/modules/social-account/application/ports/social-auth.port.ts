export abstract class SocialAuthPort {
  abstract getAuthorizationUrl(state: string): string;
  abstract exchangeCode(code: string): Promise<void>;
  abstract refreshToken(token: string): Promise<void>;
}