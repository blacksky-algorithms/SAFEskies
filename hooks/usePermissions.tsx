export const usePermissions = () => {
  const promoteToModerator = async ({
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

  return { promoteToModerator };
};
