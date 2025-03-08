import { reportToBlacksky } from '@/lib/utils/permission';
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
    const {
      targetedPostUri,
      //  reason,
      toServices,
      // uri
    } = payload;
    if (
      toServices.some(
        (service: { label: string; value: string }) =>
          service.value === 'blacksky'
      )
    ) {
      // TODO: MOVE TO NODE
      await reportToBlacksky([{ uri: targetedPostUri }]);
    }
  } catch (error) {
    console.error('Error logging moderation event:', error);
    throw error;
  }
};
