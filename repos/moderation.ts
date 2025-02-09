import { ReasonType } from '@atproto/api/dist/client/types/com/atproto/moderation/defs';

export const reportModerationEvent = async (payload: {
  targetedPostUri: string;
  reason: ReasonType;
  toServices: { label: string; value: string }[];
  targetedUserDid: string;
  uri: string;
  feedName: string | undefined;
  additionalInfo: string | undefined;
}) => {
  try {
    await fetch('/api/permissions/mod-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('Error logging moderation event:', error);
    throw error;
  }
};
