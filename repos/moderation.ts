export const fetchReportOptions = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SAFE_SKIES_API}/api/moderation/report-options`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch report options');
    }
    return response.json();
  } catch (error: unknown) {
    throw error;
  }
};

export interface BannedFromTV {
  did: string;
  reason: string | null;
  createdAt: string | null;
  tags: string[] | null;
}

export const checkUserBanStatus = async (actor: string): Promise<{ isBanned: boolean; banInfo?: BannedFromTV }> => {
  try {
    const response = await fetch(`/api/moderation/user/ban?actor=${encodeURIComponent(actor)}&limit=1`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to check ban status');
    }
    const data = await response.json();
    const isBanned = data.bannedUsers?.length === 1;
    return {
      isBanned,
      banInfo: isBanned ? data.bannedUsers[0] : undefined
    };
  } catch (error: unknown) {
    console.error('Error checking ban status:', error);
    throw error;
  }
};

export const banUser = async (actor: string, reason?: string, tags?: string[]): Promise<void> => {
  try {
    const response = await fetch('/api/moderation/user/ban', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ actor, reason, tags }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to ban user');
    }
  } catch (error: unknown) {
    console.error('Error banning user:', error);
    throw error;
  }
};

export const unbanUser = async (actor: string): Promise<void> => {
  try {
    const response = await fetch(`/api/moderation/user/ban?actor=${encodeURIComponent(actor)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to unban user');
    }
  } catch (error: unknown) {
    console.error('Error unbanning user:', error);
    throw error;
  }
};

export const checkUserMuteStatus = async (actor: string): Promise<{ muted: boolean; did: string }> => {
  try {
    const response = await fetch(`/api/moderation/user/mute?actor=${encodeURIComponent(actor)}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to check mute status');
    }
    return response.json();
  } catch (error: unknown) {
    console.error('Error checking mute status:', error);
    throw error;
  }
};

export const muteUser = async (actor: string, reason?: string, tags?: string[]): Promise<void> => {
  try {
    const response = await fetch('/api/moderation/user/mute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ actor, reason, tags }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to mute user');
    }
  } catch (error: unknown) {
    console.error('Error muting user:', error);
    throw error;
  }
};

export const unmuteUser = async (actor: string): Promise<void> => {
  try {
    const response = await fetch(`/api/moderation/user/mute?actor=${encodeURIComponent(actor)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to unmute user');
    }
  } catch (error: unknown) {
    console.error('Error unmuting user:', error);
    throw error;
  }
};
