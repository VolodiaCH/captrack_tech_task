export interface OAuthProfile {
  provider: "GOOGLE" | "GITHUB";
  providerUserId: string;
  email?: string;
  displayName: string;
  avatarUrl?: string;
}

export interface OAuthProvider {
  getAuthorizationUrl(state: string): string;
  exchangeCodeForToken(code: string): Promise<string>;
  fetchProfile(accessToken: string): Promise<OAuthProfile>;
}
