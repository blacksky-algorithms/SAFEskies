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
import { ReportOption } from '@/lib/types/moderation';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { useModal } from '@/contexts/modal-context';
import { useToast } from '@/contexts/toast-context';
import {
  MODERATION_SERVICES,
  ModerationService,
} from '@/lib/constants/moderation';
import { reportModerationEvent } from '@/repos/moderation';
import { VisualIntent } from '@/enums/styles';
import { canPerformAction } from '@/repos/permission';
import { useProfileData } from './useProfileData';
import { useSearchParams } from 'next/navigation';

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
  const { profile, isLoading } = useProfileData();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const uri = searchParams.get('uri');

  const [isReportSubmitting, setIsReportSubmitting] = useState(false);
  const [reportData, dispatch] = useReducer(reportDataReducer, {
    post: null,
    reason: null,
    toServices: [MODERATION_SERVICES[0]],
    moderatedPostUri: null,
    additionalInfo: '',
  } as ReportDataState);
  const [isMod, setIsMod] = useState(false);

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
      feed.length === 0
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
      const payload = {
        targetedPostUri: reportData.moderatedPostUri,
        reason: reportData.reason.reason,
        toServices: reportData.toServices,
        targetedUserDid: reportData.post.author.did,
        uri: reportData.post.uri,
        feedName: displayName || 'Unnamed Feed',
        additionalInfo: reportData.additionalInfo,
      };
      await reportModerationEvent(payload);
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
  }, [reportData, feed, displayName, closeModalInstance, toast]);

  const isModServiceChecked = useCallback(
    (service: ModerationService) =>
      reportData.toServices.some((item) => item.value === service.value),
    [reportData.toServices]
  );

  useEffect(() => {
    const checkRole = async () => {
      if (!profile || isLoading) {
        setIsMod(false);
        return;
      }
      try {
        const hasModPermissions = await canPerformAction(
          profile.did,
          'post_delete',
          uri
        );
        setIsMod(hasModPermissions);
      } catch (err) {
        console.error('Error checking permissions:', err);
        setIsMod(false);
      }
    };
    checkRole();
  }, [uri, profile, isLoading]);

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
