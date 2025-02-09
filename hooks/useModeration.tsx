import { useState, ChangeEvent, useEffect } from 'react';
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
import { ReasonType } from '@atproto/api/dist/client/types/com/atproto/moderation/defs';
import { VisualIntent } from '@/enums/styles';
import { canPerformAction } from '@/repos/permission';
import { useProfileData } from './useProfileData';
import { useSearchParams } from 'next/navigation';

interface ReportDataState {
  post: PostView | null;
  reason: ReportOption | null;
  toServices: typeof MODERATION_SERVICES;
  moderatedPostUri: string | null;
  additionalInfo: string;
}

interface UseModerationOptions {
  displayName?: string;
  feed: FeedViewPost[];
}

export function useModeration({ displayName, feed }: UseModerationOptions) {
  const { openModalInstance, closeModalInstance } = useModal();
  const { profile, isLoading } = useProfileData();
  const { toast } = useToast();
  const [isReportSubmitting, setIsReportSubmitting] = useState(false);
  const [reportData, setReportData] = useState<ReportDataState>({
    post: null,
    reason: null,
    toServices: [MODERATION_SERVICES[0]],
    moderatedPostUri: null,
    additionalInfo: '',
  });

  const searchParams = useSearchParams();
  const uri = searchParams.get('uri');

  const [isMod, setIsMod] = useState(false);

  const handleModAction = (post: PostView) => {
    setReportData((prev) => ({
      ...prev,
      moderatedPostUri: post.uri,
      post,
    }));
    openModalInstance(MODAL_INSTANCE_IDS.MOD_MENU, true);
  };

  const handleSelectReportReason = (reason: ReportOption) => {
    setReportData((prev) => ({
      ...prev!,
      reason,
    }));
    openModalInstance(MODAL_INSTANCE_IDS.REPORT_POST, true);
  };

  const handleAddtlInfoChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setReportData((prev) => ({
      ...prev,
      additionalInfo: event.target.value,
    }));
  };

  const reportModerationEvent = async (payload: {
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

  const handleReportPost = async () => {
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

    try {
      setIsReportSubmitting(true);

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

      setReportData((prev) => ({
        ...prev,
        moderatedPostUri: null,
        toServices: [MODERATION_SERVICES[0]],
        post: null,
      }));
      toast({
        title: 'Success',
        message: 'Post reported successfully',
        intent: VisualIntent.Success,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        message: 'Unable to report post. Please try again later.',
        intent: VisualIntent.Error,
      });
    } finally {
      setIsReportSubmitting(false);
    }
  };

  const isModServiceChecked = (data: ModerationService) =>
    reportData.toServices.some((item) => item.value === data.value);

  const handleReportToChange = (updatedReportToData: ModerationService) => {
    if (isModServiceChecked(updatedReportToData)) {
      setReportData((prev) => ({
        ...prev,
        toServices: prev.toServices.filter(
          (item) => item.value !== updatedReportToData.value
        ),
      }));
    } else {
      setReportData((prev) => ({
        ...prev,
        toServices: [...prev.toServices, updatedReportToData],
      }));
    }
  };

  const onClose = () =>
    setReportData((prev) => ({
      ...prev,
      moderatedPostUri: null,
      toServices: [MODERATION_SERVICES[0]],
      post: null,
    }));

  useEffect(() => {
    const checkRole = async () => {
      if (!profile || isLoading) {
        setIsMod(false);
        return;
      }
      const hasModPermissions = await canPerformAction(
        profile.did,
        'post_delete',
        uri
      );
      setIsMod(hasModPermissions);
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
