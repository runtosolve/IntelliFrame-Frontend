import { Amplify } from "aws-amplify";

export const OIDC_PROVIDER =
  process.env.NEXT_PUBLIC_OIDC_PROVIDER?.trim() || "GoogleWorkspace";

const userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID?.trim() ?? "";
const userPoolClientId = process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID?.trim() ?? "";
const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN?.trim() ?? "";

export function isAuthConfigured(): boolean {
  return Boolean(userPoolId && userPoolClientId && cognitoDomain);
}

let configured = false;

/** Configure Amplify Auth once on the client (Cognito + Google Workspace OIDC). */
export function configureAuth(): void {
  if (configured || typeof window === "undefined") return;
  if (!isAuthConfigured()) {
    console.warn(
      "Cognito env vars missing (NEXT_PUBLIC_USER_POOL_ID, NEXT_PUBLIC_USER_POOL_CLIENT_ID, NEXT_PUBLIC_COGNITO_DOMAIN).",
    );
    return;
  }

  const origin = window.location.origin;
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
        loginWith: {
          oauth: {
            domain: cognitoDomain,
            scopes: ["openid", "email", "profile"],
            redirectSignIn: [`${origin}/`],
            redirectSignOut: [`${origin}/`],
            responseType: "code",
          },
        },
      },
    },
  });
  configured = true;
}
