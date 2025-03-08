import {
  useState,
  useReducer,
  useCallback,
  useEffect,
  ChangeEvent,
} from 'react';
import {
  FeedViewPost,
  PostView,
} from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { ModAction, ReportOption } from '@/lib/types/moderation';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { useModal } from '@/contexts/modal-context';
import { useToast } from '@/contexts/toast-context';
import {
  MODERATION_SERVICES,
  ModerationService,
} from '@/lib/constants/moderation';
import { VisualIntent } from '@/enums/styles';
import { useProfileData } from './useProfileData';
import { useSearchParams } from 'next/navigation';

// TODO: use node implementation
const canPerformAction = async (
  userDid: string,
  action: ModAction,
  uri: string | null
): Promise<boolean> => {
  // if (!userDid || !uri) return false;
  // return true;
  // const feedRole = await getFeedRole(userDid, uri);

  // return canPerformWithRole(feedRole, action);
  return true;
};

interface ReportDataState {
  post: PostView | null;
  reason: ReportOption | null;
  toServices: ModerationService[];
  moderatedPostUri: string | null;
  additionalInfo: string;
}

type ReportDataAction =
  | { type: 'SET_POST'; payload: PostView }
  | { type: 'SET_REASON'; payload: ReportOption }
  | { type: 'SET_ADDITIONAL_INFO'; payload: string }
  | { type: 'TOGGLE_SERVICE'; payload: ModerationService }
  | { type: 'RESET' };

const reportDataReducer = (
  state: ReportDataState,
  action: ReportDataAction
): ReportDataState => {
  switch (action.type) {
    case 'SET_POST':
      return {
        ...state,
        post: action.payload,
        moderatedPostUri: action.payload.uri,
      };
    case 'SET_REASON':
      return { ...state, reason: action.payload };
    case 'SET_ADDITIONAL_INFO':
      return { ...state, additionalInfo: action.payload };
    case 'TOGGLE_SERVICE': {
      const exists = state.toServices.find(
        (item) => item.value === action.payload.value
      );
      if (exists) {
        return {
          ...state,
          toServices: state.toServices.filter(
            (item) => item.value !== action.payload.value
          ),
        };
      } else {
        return { ...state, toServices: [...state.toServices, action.payload] };
      }
    }
    case 'RESET':
      return {
        post: null,
        reason: null,
        toServices: [MODERATION_SERVICES[0] as ModerationService],
        moderatedPostUri: null,
        additionalInfo: '',
      };
    default:
      return state;
  }
};

interface UseModerationOptions {
  displayName?: string;
  feed: FeedViewPost[];
}

export function useModeration({ displayName, feed }: UseModerationOptions) {
  const { openModalInstance, closeModalInstance } = useModal();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const uri = searchParams.get('uri');

  const [isReportSubmitting, setIsReportSubmitting] = useState(false);
  const [reportData, dispatch] = useReducer(reportDataReducer, {
    post: null,
    reason: null,
    toServices: [],
    moderatedPostUri: null,
    additionalInfo: '',
  } as ReportDataState);
  const [isMod, setIsMod] = useState(true); // TODO: refine this

  const handleModAction = useCallback(
    (post: PostView) => {
      dispatch({ type: 'SET_POST', payload: post });
      openModalInstance(MODAL_INSTANCE_IDS.MOD_MENU, true);
    },
    [openModalInstance]
  );

  const handleSelectReportReason = useCallback(
    (reason: ReportOption) => {
      dispatch({ type: 'SET_REASON', payload: reason });
      openModalInstance(MODAL_INSTANCE_IDS.REPORT_POST, true);
    },
    [openModalInstance]
  );

  const handleAddtlInfoChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      dispatch({ type: 'SET_ADDITIONAL_INFO', payload: event.target.value });
    },
    []
  );

  const handleReportToChange = useCallback((service: ModerationService) => {
    dispatch({ type: 'TOGGLE_SERVICE', payload: service });
  }, []);

  const onClose = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);
  const handleReportPost = useCallback(async () => {
    if (
      !reportData.post ||
      !reportData.moderatedPostUri ||
      !reportData.reason ||
      feed.length === 0 ||
      reportData.toServices.length === 0
    ) {
      toast({
        title: 'Error',
        message: 'No Post Selected.',
        intent: VisualIntent.Error,
      });
      return;
    }
    setIsReportSubmitting(true);

    try {
      const payload = [
        {
          targetedPostUri: reportData.moderatedPostUri,
          reason: reportData.reason.reason,
          toServices: reportData.toServices,
          targetedUserDid: reportData.post.author.did,
          uri,
          feedName: displayName || 'Unnamed Feed',
          additionalInfo: reportData.additionalInfo,
          action: 'post_delete',
          metadata: { post: reportData.post },
        },
      ];
      console.log({ payload });
      const response = await fetch('/api/moderation/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to report post');
      }
      await response.json();

      closeModalInstance(MODAL_INSTANCE_IDS.REPORT_POST);
      closeModalInstance(MODAL_INSTANCE_IDS.MOD_MENU);
      dispatch({ type: 'RESET' });
      toast({
        title: 'Success',
        message: 'Post reported successfully',
        intent: VisualIntent.Success,
      });
    } catch (error) {
      console.error('Error reporting post:', error);

      toast({
        title: 'Error',
        message: 'Unable to report post. Please try again later.',
        intent: VisualIntent.Error,
      });
    } finally {
      setIsReportSubmitting(false);
    }
  }, [reportData, feed]);

  const isModServiceChecked = useCallback(
    (service: ModerationService) =>
      reportData.toServices.some((item) => item.value === service.value),
    [reportData.toServices]
  );

  return {
    reportData,
    isReportSubmitting,
    handleModAction,
    handleSelectReportReason,
    handleReportPost,
    handleReportToChange,
    handleAddtlInfoChange,
    isModServiceChecked,
    onClose,
    isMod,
  };
}
