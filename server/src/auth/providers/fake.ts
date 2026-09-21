import { OAuthProvider, OAuthProfile } from "./types.js";

export class FakeOAuthProvider implements OAuthProvider {
  constructor(
    private provider: "GOOGLE" | "GITHUB",
    private profile: OAuthProfile,
  ) {}

  getAuthorizationUrl(): string {
    return "";
  }

  async exchangeCodeForToken(): Promise<string> {
    return "fake-access-token";
  }

  async fetchProfile(): Promise<OAuthProfile> {
    return this.profile;
  }
}
