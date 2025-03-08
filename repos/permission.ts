import { fetchWithAuth } from '@/lib/api';

export const promoteToModerator = async ({
  targetUserDid,
  uri,
  setByUserDid,
  feedName,
}: {
  targetUserDid: string;
  uri: string;
  setByUserDid: string;
  feedName: string;
}) => {
  const response = await fetch('/api/permissions/promote', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      targetUserDid,
      uri,
      setByUserDid,
      feedName,
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to promote moderator');
  }

  return response.json();
};

export const demoteModerator = async ({
  modDid,
  uri,
  setByUserDid,
  feedName,
}: {
  modDid: string;
  uri: string;
  setByUserDid: string;
  feedName: string;
}) => {
  const response = await fetch('/api/permissions/demote', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      modDid,
      uri,
      setByUserDid,
      feedName,
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to demote moderator');
  }

  return response.json();
};

export const fetchModsByFeed = async (
  uri: string,
  displayName: string
): Promise<{
  status: number;
  feed: { uri: string; displayName: string };
  moderators: { did: string; handle: string }[];
  error?: string | null;
}> => {
  try {
    const response = await fetchWithAuth(
      `/api/permissions/admin/moderators?feed=${encodeURIComponent(uri)}`,
      { method: 'GET' }
    );
    if (!response || !response.ok) {
      throw new Error('Failed to fetch moderators for feed ' + uri);
    }
    const data = await response.json();

    return {
      status: 200,
      error: null,
      feed: { uri, displayName },
      moderators: data.moderators,
    };
  } catch (error: unknown) {
    return {
      status: 500,
      error:
        (error instanceof Error ? error.message : 'Failed to sign in') ||
        'Failed to sign in',
      feed: { uri: '', displayName: '' },
      moderators: [],
    };
  }
};
