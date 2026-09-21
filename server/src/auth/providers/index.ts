import { OAuthProvider } from "./types.js";
import { GoogleOAuthProvider } from "./google.js";
import { GitHubOAuthProvider } from "./github.js";

const providers: Record<string, OAuthProvider> = {
  google: new GoogleOAuthProvider(),
  github: new GitHubOAuthProvider(),
};

export function getProvider(name: string, override?: OAuthProvider): OAuthProvider {
  if (override) return override;
  const provider = providers[name.toLowerCase()];
  if (!provider) throw new Error(`Provider ${name} not found`);
  return provider;
}
