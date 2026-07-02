import { AuthProvider } from "react-oidc-context";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_tX8VGAryE",
  client_id: "57mvrdlt25lavm7epi144h67h3",
  redirect_uri: "https://purlinline-app.runtosolve.com/callback",
  response_type: "code",
  scope: "email openid profile",
};

export default function CognitoAuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthProvider {...cognitoAuthConfig}>{children}</AuthProvider>;
}
