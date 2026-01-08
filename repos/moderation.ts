import { ModerationEventType, EmitEventResponse, ModerationEventParams } from '@/lib/types/moderation';

export const fetchReportOptions = async () => {
  try {
    const response = await fetch('/api/moderation/report-options');
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

export const fetchEscalatedUsers = async (limit = 20, cursor?: string) => {
  try {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.append('cursor', cursor);
    const response = await fetch(`/api/moderation/escalated-users?${params}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch escalated users');
    }
    return response.json();
  } catch (error: unknown) {
    console.error('Error fetching escalated users:', error);
    throw error;
  }
};

export const fetchProfileModerationData = async (did: string) => {
  try {
    const response = await fetch(`/api/moderation/profile/${encodeURIComponent(did)}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch profile moderation data');
    }
    return response.json();
  } catch (error: unknown) {
    console.error('Error fetching profile moderation data:', error);
    throw error;
  }
};

export const emitModerationEvent = async (
  did: string,
  eventType: ModerationEventType,
  eventParams?: ModerationEventParams,
  subjectUri?: string,
  subjectCid?: string
): Promise<EmitEventResponse> => {
  try {
    const body: Record<string, unknown> = { did, eventType, eventParams };
    if (subjectUri) {
      body.subjectUri = subjectUri;
    }
    if (subjectCid) {
      body.subjectCid = subjectCid;
    }
    const response = await fetch('/api/moderation/emit-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to emit moderation event');
    }

    return response.json();
  } catch (error: unknown) {
    console.error('Error emitting moderation event:', error);
    throw error;
  }
};
