# BlueSky OAuth Authentication Flow Documentation

## Overview

This document provides a detailed explanation of the BlueSky OAuth authentication flow used in this application. It describes the purpose, implementation, involved components, security considerations, and future improvements.

The flow is designed to authenticate users with Bluesky OAuth and manage session persistence securely via Supabase and IronSession.

---

## High-Level Flow

1. **User Initiates Login**: The client sends a request to start the OAuth authorization process.
2. **BlueSky Authorization**: BlueSky OAuth service validates and issues an authorization code.
3. **Callback Route**: The server exchanges the code for access and refresh tokens.
4. **Session Handling**:
   - Tokens are validated and stored securely in the session.
   - User profile data is fetched using the DID (Decentralized Identifier).
5. **Persist Session and User Profile**: The session and user profile are stored securely in Supabase and IronSession.
6. **Redirect**: The user is redirected to a protected page.

---

## Components

### 1. **BlueskyOAuthClientSingleton**

- **Purpose**: A singleton class that centralizes the creation and use of `NodeOAuthClient`.
- **Implementation**:
  - Ensures only one instance of the OAuth client exists.
  - Uses the `StateStore` and `SessionStore` for state management.

### 2. **`BLUE_SKY_CLIENT_META_DATA`**

- A constant containing metadata for the OAuth client.
- **Location**: `@/utils/consts`
- **Structure**:

  ```ts
  export const BLUE_SKY_CLIENT_META_DATA: OAuthClientMetadataInput = {
    client_name: `${baseUrl}`,
    client_id: `${baseUrl}/oauth/client-metadata.json`,
    client_uri: `${baseUrl}`,
    redirect_uris: [`${baseUrl}/oauth/callback`],
    policy_uri: `${baseUrl}/policy`,
    tos_uri: `${baseUrl}/tos`,
    scope: 'atproto transition:generic',
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    application_type: 'web',
    token_endpoint_auth_method: 'none',
    dpop_bound_access_tokens: true,
  };
  ```

- **Purpose**:
  - Centralizes OAuth client configuration.
  - Simplifies maintainability.

### 3. **Supabase Storage**

- **StateStore**: Manages OAuth state to prevent CSRF attacks.
- **SessionStore**: Manages session data (e.g., access and refresh tokens).
- **Encryption**:
  - AES-256 encryption is applied to store sensitive OAuth data.

### 4. **IronSession**

- Used to persist user sessions securely on the server side.
- Prevents exposure of sensitive credentials on the client side.

### 5. **`app/(api)/oauth/callback/route.ts`**

- Handles the callback from the OAuth service.
- Validates tokens and fetches the user profile.
- Stores the user profile and session data.

### 6. **AtprotoAgentSingleton**

- A singleton for interacting with the Atproto API.
- Handles requests such as `getProfile`.

### 7. **User Profile Handling**

- User profiles are normalized and stored in the `profiles` table in Supabase.
- **Location**: `repos/user.ts`
- **Methods**:
  - `saveUserProfile`: Upserts user profile data.
  - `getUserProfile`: Fetches user profile based on DID.

---

## Development Considerations

### Local Development with ngrok

To support BlueSky OAuth, client metadata must be live-served and accessible via a public URL. For development purposes:

- Use tools like **ngrok** to expose your local server to a public domain.
- Set `NEXT_PUBLIC_URL` in your environment variables to the ngrok URL.

Example:

```env
NEXT_PUBLIC_URL=https://<your-ngrok-url>.ngrok.io
```

### Deploy Previews

When using platforms like Netlify for deploy previews, ensure that `NEXT_PUBLIC_URL` is set to a live URL accessible by BlueSky. This can be a temporary ngrok URL or a custom preview domain.

---

## Security Concerns

### 1. **Token Management**

- **Access Tokens**: Short-lived; should not be exposed on the client.
- **Refresh Tokens**:
  - Used to obtain new access tokens.
  - Must be stored securely using encryption.
- **Mitigation**:
  - Supabase storage encrypts tokens before saving.
  - IronSession ensures secure, server-side storage.

### 2. **CSRF Protection**

- The `StateStore` ensures that OAuth state parameters match between the authorization request and callback.

### 3. **Session Hijacking**

- Sessions are validated against user DIDs.
- OAuth tokens are automatically refreshed when expired using the `getTokenInfo('auto')` method.

### 4. **API Security**

- All user requests use `AtprotoAgentSingleton` to centralize API calls.
- Sensitive operations (e.g., saving profiles) require token-based authorization.

---

## Future Considerations

### 1. **Token Expiration Handling**

- Although `getTokenInfo('auto')` handles auto-refreshing, monitor for edge cases where tokens may fail to refresh.
- Implement retries or fallbacks to reinitiate the OAuth flow if necessary.

### 2. **Enhanced Logging**

- Centralize logging for all OAuth and API interactions.
- Include structured logs to aid debugging and monitoring.

### 3. **Multi-Account Support**

- Extend the implementation to allow users to log in with multiple accounts.
- Ensure session separation for different users.

### 4. **Error Handling Improvements**

- Replace generic errors with user-friendly error messages.
- Add retry mechanisms for transient network failures.

### 5. **Performance Optimizations**

- Reduce redundant calls to external APIs (e.g., BlueSky OAuth and Atproto API).
- Cache frequently accessed user profiles for better performance.

---

## Summary

This implementation leverages BlueSky's OAuth system, Supabase for secure storage, and IronSession for session management. By using singleton patterns (`BlueskyOAuthClientSingleton` and `AtprotoAgentSingleton`), it ensures centralized control and avoids redundant object creation.

### Key Points

- Secure storage and encryption of OAuth data.
- Auto-refresh of access tokens using BlueSky's provided mechanisms.
- Robust error handling to maintain a smooth user experience.

### Key Files

- `repos/blue-sky-oauth-client.ts` (OAuth client singleton)
- `app/(api)/oauth/callback/route.ts` (OAuth callback handler)
- `repos/storage.ts` (State and session stores)
- `repos/user.ts` (User profile management)
- `utils/consts.ts` (OAuth metadata)

This design is secure, scalable, and ensures separation of concerns for OAuth, session handling, and user profile management.

---

## Diagram

```plaintext
User
  |
  v
[Login Request]
  |
  v
BlueskyOAuthClientSingleton --> Authorization Endpoint
  |
  v
[Callback Route] --> Validate Token --> Auto-Refresh --> Fetch Profile
  |
  v
Normalize Profile --> Save to Supabase --> Store Session
  |
  v
Redirect User --> Protected Page
```

---

## Final Notes

The current implementation aligns with best practices for OAuth flows. Future updates should prioritize usability improvements, additional validations, and monitoring for enhanced security and scalability.
