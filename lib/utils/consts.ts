import { OAuthClientMetadataInput } from '@atproto/oauth-client-node';

const baseUrl: string = process.env.NEXT_PUBLIC_URL as string;
// Bluesky OAuth Metadata
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

export const CONTENT_LABELS = ['porn', 'sexual', 'nudity', 'graphic-media'];
