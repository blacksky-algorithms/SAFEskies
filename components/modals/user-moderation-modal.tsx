'use client';

import React, { useState, useEffect, useContext } from 'react';
import { Modal } from '@/components/modals';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { Button } from '@/components/button';
import { OptimizedImage } from '@/components/optimized-image';
import { VisualIntent } from '@/enums/styles';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { checkUserBanStatus, banUser, unbanUser, BannedFromTV, checkUserMuteStatus, muteUser, unmuteUser, fetchProfileModerationData, emitModerationEvent } from '@/repos/moderation';
import { ToastContext } from '@/contexts/toast-context';
import { ProfileModerationResponse, ModerationEventType, EscalatedItem, EscalatedPostItem } from '@/lib/types/moderation';
import { getPostUrl } from '@/components/post/utils';

type UserLike = {
  did: string;
  handle?: string;
  displayName?: string;
  avatar?: string | null;
};

interface UserModerationModalProps {
  user: ProfileViewBasic | EscalatedItem | UserLike | null;
  onClose: () => void;
}

export const UserModerationModal = ({
  user,
  onClose,
}: UserModerationModalProps) => {
  const toastContext = useContext(ToastContext);

  const [banStatus, setBanStatus] = useState<{
    isBanned: boolean;
    banInfo?: BannedFromTV;
    error?: string;
  }>({
    isBanned: false,
  });

  const [muteStatus, setMuteStatus] = useState<{
    isMuted: boolean;
    error?: string;
  }>({
    isMuted: false,
  });

  const [moderationData, setModerationData] = useState<ProfileModerationResponse | null>(null);
  const [loadingModerationData, setLoadingModerationData] = useState(false);

  const [banForm, setBanForm] = useState({
    showForm: false,
    reason: '',
    tags: [] as string[],
    newTag: '',
  });

  // Ozone Actions state
  const [ozoneAction, setOzoneAction] = useState<{
    type: ModerationEventType;
    loading: boolean;
    comment: string;
    // Takedown specific
    durationInHours: string;
    // Label specific
    createLabelVals: string[];
    negateLabelVals: string[];
    newLabel: string;
    // Tag specific
    addTags: string[];
    removeTags: string[];
    newTag: string;
    // Comment specific
    sticky: boolean;
  }>({
    type: 'acknowledge',
    loading: false,
    comment: '',
    durationInHours: '',
    createLabelVals: [],
    negateLabelVals: [],
    newLabel: '',
    addTags: [],
    removeTags: [],
    newTag: '',
    sticky: false,
  });

  // Check ban and mute status when modal opens
  useEffect(() => {
    if (user?.did) {
      // Fetch enriched profile data
      setLoadingModerationData(true);
      fetchProfileModerationData(user.did)
        .then((data) => {
          setModerationData(data);
        })
        .catch((error) => {
          console.error('Failed to fetch moderation data:', error);
          setModerationData({ error: 'Failed to load moderation data. Try refreshing.' } as ProfileModerationResponse);
        })
        .finally(() => {
          setLoadingModerationData(false);
        });

      // Check ban status
      checkUserBanStatus(user.did)
        .then((result) => {
          setBanStatus({
            isBanned: result.isBanned,
            banInfo: result.banInfo,
          });
        })
        .catch((error) => {
          console.error('Failed to check ban status:', error);
          setBanStatus({ isBanned: false, error: 'Failed to check ban status. Try refreshing.' });
        });

      // Check mute status
      checkUserMuteStatus(user.did)
        .then((result) => {
          setMuteStatus({
            isMuted: result.muted,
          });
        })
        .catch((error) => {
          console.error('Failed to check mute status:', error);
          setMuteStatus({ isMuted: false, error: 'Failed to check mute status. Try refreshing.' });
        });
    }
  }, [user?.did]);

  if (!user) {
    return null;
  }

  const handleBanUser = async () => {
    const wasAlreadyBanned = banStatus.isBanned;
    const previousBanInfo = banStatus.banInfo;

    // Optimistic update
    setBanStatus(prev => ({
      ...prev,
      isBanned: !prev.isBanned,
      banInfo: !prev.isBanned ? undefined : prev.banInfo
    }));

    try {
      if (wasAlreadyBanned) {
        await unbanUser(user.did);
      } else {
        await banUser(user.did);
      }
    } catch (error) {
      // Revert optimistic update on error
      setBanStatus({
        isBanned: wasAlreadyBanned,
        banInfo: previousBanInfo
      });
      console.error('Failed to update ban status:', error);
      toastContext?.toast({
        title: 'Error',
        message: `Failed to ${wasAlreadyBanned ? 'unban' : 'ban'} user`,
        intent: VisualIntent.Error,
      });
    }
  };

  const handleMuteUser = async () => {
    const wasAlreadyMuted = muteStatus.isMuted;

    // Optimistic update
    setMuteStatus(prev => ({
      ...prev,
      isMuted: !prev.isMuted,
    }));

    try {
      if (wasAlreadyMuted) {
        await unmuteUser(user.did);
        toastContext?.toast({
          title: 'Success',
          message: 'User unmuted successfully',
          intent: VisualIntent.Success,
        });
      } else {
        await muteUser(user.did);
        toastContext?.toast({
          title: 'Success',
          message: 'User muted successfully',
          intent: VisualIntent.Success,
        });
      }
    } catch (error) {
      // Revert optimistic update on error
      setMuteStatus({
        isMuted: wasAlreadyMuted,
      });
      console.error('Failed to update mute status:', error);
      toastContext?.toast({
        title: 'Error',
        message: `Failed to ${wasAlreadyMuted ? 'unmute' : 'mute'} user`,
        intent: VisualIntent.Error,
      });
    }
  };

  const handleShowBanForm = () => {
    setBanForm(prev => ({ ...prev, showForm: true }));
  };

  const handleCancelBan = () => {
    setBanForm({
      showForm: false,
      reason: '',
      tags: [],
      newTag: '',
    });
  };

  const handleAddTag = () => {
    const trimmedTag = banForm.newTag.trim();
    if (trimmedTag && !banForm.tags.includes(trimmedTag)) {
      setBanForm(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
        newTag: '',
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setBanForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleConfirmBan = async () => {
    const wasAlreadyBanned = banStatus.isBanned;
    const previousBanInfo = banStatus.banInfo;

    // Optimistic update
    setBanStatus(prev => ({
      ...prev,
      isBanned: true,
      banInfo: undefined
    }));

    // Hide form
    setBanForm({
      showForm: false,
      reason: '',
      tags: [],
      newTag: '',
    });

    try {
      await banUser(user.did, banForm.reason || undefined, banForm.tags.length > 0 ? banForm.tags : undefined);

      // Refresh ban status to get updated info
      const result = await checkUserBanStatus(user.did);
      setBanStatus({
        isBanned: result.isBanned,
        banInfo: result.banInfo,
      });
    } catch (error) {
      // Revert optimistic update on error
      setBanStatus({
        isBanned: wasAlreadyBanned,
        banInfo: previousBanInfo
      });
      console.error('Failed to ban user:', error);
      toastContext?.toast({
        title: 'Error',
        message: 'Failed to ban user',
        intent: VisualIntent.Error,
      });
    }
  };

  // Ozone Action Handlers
  const resetOzoneAction = () => {
    setOzoneAction({
      type: 'acknowledge',
      loading: false,
      comment: '',
      durationInHours: '',
      createLabelVals: [],
      negateLabelVals: [],
      newLabel: '',
      addTags: [],
      removeTags: [],
      newTag: '',
      sticky: false,
    });
  };

  const handleOzoneTypeChange = (type: ModerationEventType) => {
    setOzoneAction({
      type,
      loading: false,
      comment: '',
      durationInHours: '',
      createLabelVals: [],
      negateLabelVals: [],
      newLabel: '',
      addTags: [],
      removeTags: [],
      newTag: '',
      sticky: false,
    });
  };

  const refreshModerationData = async () => {
    try {
      const data = await fetchProfileModerationData(user.did);
      setModerationData(data);
    } catch (error) {
      console.error('Failed to refresh moderation data:', error);
    }
  };

  const handleOzoneSubmit = async () => {
    if (!ozoneAction.type) return;

    setOzoneAction(prev => ({ ...prev, loading: true }));

    try {
      const eventParams: Record<string, unknown> = {};

      switch (ozoneAction.type) {
        case 'takedown':
          if (ozoneAction.comment) eventParams.comment = ozoneAction.comment;
          if (ozoneAction.durationInHours) eventParams.durationInHours = parseInt(ozoneAction.durationInHours);
          break;
        case 'reverseTakedown':
        case 'acknowledge':
        case 'escalate':
          if (ozoneAction.comment) eventParams.comment = ozoneAction.comment;
          break;
        case 'comment':
          eventParams.comment = ozoneAction.comment;
          if (ozoneAction.sticky) eventParams.sticky = true;
          break;
        case 'label':
          eventParams.createLabelVals = ozoneAction.createLabelVals;
          eventParams.negateLabelVals = ozoneAction.negateLabelVals;
          if (ozoneAction.comment) eventParams.comment = ozoneAction.comment;
          break;
        case 'tag':
          eventParams.add = ozoneAction.addTags;
          eventParams.remove = ozoneAction.removeTags;
          if (ozoneAction.comment) eventParams.comment = ozoneAction.comment;
          break;
      }

      // Check if this is an escalated post and pass subject info for post-level moderation
      const isEscalatedPost = 'type' in user && user.type === 'post';
      const subjectUri = isEscalatedPost ? (user as EscalatedPostItem).postUri : undefined;
      const subjectCid = isEscalatedPost ? (user as EscalatedPostItem).postCid : undefined;

      const result = await emitModerationEvent(user.did, ozoneAction.type, eventParams, subjectUri, subjectCid);

      toastContext?.toast({
        title: 'Success',
        message: result.message || `Successfully emitted ${ozoneAction.type} event`,
        intent: VisualIntent.Success,
      });

      resetOzoneAction();
      await refreshModerationData();
    } catch (error) {
      console.error('Failed to emit moderation event:', error);
      toastContext?.toast({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to emit moderation event',
        intent: VisualIntent.Error,
      });
    } finally {
      setOzoneAction(prev => ({ ...prev, loading: false }));
    }
  };

  const getActionLabel = (type: ModerationEventType): string => {
    const labels: Record<ModerationEventType, string> = {
      takedown: 'Takedown',
      reverseTakedown: 'Reverse Takedown',
      acknowledge: 'Acknowledge',
      escalate: 'Escalate',
      comment: 'Add Comment',
      label: 'Add Labels',
      tag: 'Add Tags',
    };
    return labels[type];
  };

  const canSubmitOzoneAction = (): boolean => {
    if (!ozoneAction.type || ozoneAction.loading) return false;

    switch (ozoneAction.type) {
      case 'comment':
        return ozoneAction.comment.trim().length > 0;
      case 'label':
        return ozoneAction.createLabelVals.length > 0 || ozoneAction.negateLabelVals.length > 0;
      case 'tag':
        return ozoneAction.addTags.length > 0 || ozoneAction.removeTags.length > 0;
      default:
        return true;
    }
  };

  return (
    <Modal
      id={MODAL_INSTANCE_IDS.USER_MODERATION}
      title='User Moderation'
      onClose={onClose}
      size='large'
    >
      <div className='flex flex-col h-full'>
        {/* User Profile Section - Full Width Top */}
        <div className='flex items-center space-x-4 p-4 border rounded-lg flex-shrink-0'>
          {user.avatar ? (
            <OptimizedImage
              src={user.avatar}
              alt={`Avatar of ${user.handle}`}
              className='w-16 h-16 rounded-full'
            />
          ) : (
            <div className='w-16 h-16 bg-app-background rounded-full flex items-center justify-center'>
              <span className='text-app text-xl font-semibold'>
                {(user.displayName || user.handle || '?').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className='flex-1'>
            <h3 className='text-lg font-semibold text-app'>
              {user.displayName || user.handle || 'Unknown User'}
            </h3>
            {user.handle && <p className='text-app'>@{user.handle}</p>}
            <p className='text-sm text-app font-mono mt-1'>
              {user.did}
            </p>
            {'type' in user && user.type === 'post' && 'postUri' in user && (
              <a
                href={getPostUrl(user.postUri as string)}
                target="_blank"
                rel="noopener noreferrer"
                className='inline-block mt-2 text-sm text-app-primary hover:underline'
              >
                View Reported Post →
              </a>
            )}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className='flex flex-row gap-6 flex-1 min-h-0 mt-6 overflow-hidden'>
          {/* Left Column - Actions */}
          <div className='flex-1 min-w-0 space-y-4 overflow-y-auto'>
            {/* Moderation Actions */}
          {!banForm.showForm && (
            <div className='space-y-3'>
              <h4 className='text-md font-semibold text-app'>Quick Actions</h4>
              {(banStatus.error || muteStatus.error) && (
                <div className='p-3 bg-yellow-50 border border-yellow-200 rounded-md'>
                  {banStatus.error && (
                    <p className='text-sm text-yellow-700'>{banStatus.error}</p>
                  )}
                  {muteStatus.error && (
                    <p className='text-sm text-yellow-700'>{muteStatus.error}</p>
                  )}
                </div>
              )}
              <div className='grid grid-cols-2 gap-3'>
                <Button
                  intent={VisualIntent.Secondary}
                  className="!bg-red-400 hover:!bg-red-500 focus:!ring-red-400"
                  onClick={banStatus.isBanned ? handleBanUser : handleShowBanForm}
                  disabled={!!banStatus.error}
                >
                  {banStatus.isBanned ? 'Unban from TV' : 'Ban from TV'}
                </Button>
                <Button
                  intent={VisualIntent.Secondary}
                  onClick={handleMuteUser}
                  disabled={!!muteStatus.error}
                >
                  {muteStatus.isMuted ? 'Greenlist Unmute' : 'Greenlist Mute'}
                </Button>
              </div>
            </div>
          )}

          {/* Ban Form Section */}
          {banForm.showForm && (
            <div className='space-y-4 p-4 border border-app-border rounded-lg bg-app-background'>
              <h4 className='text-md font-semibold text-app'>Ban User Details</h4>
              <div>
                <label className='text-sm font-medium text-app mb-2 block'>
                  Reason (optional):
                </label>
                <textarea
                  value={banForm.reason}
                  onChange={(e) => setBanForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder='Enter ban reason...'
                  className='w-full p-3 border border-app-border rounded-md bg-app-background text-app placeholder-app-secondary resize-none'
                  rows={3}
                />
              </div>
              <div>
                <label className='text-sm font-medium text-app mb-2 block'>
                  Tags (optional):
                </label>
                <div className='flex gap-2 mb-2'>
                  <input
                    type='text'
                    value={banForm.newTag}
                    onChange={(e) => setBanForm(prev => ({ ...prev, newTag: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder='Add a tag...'
                    className='flex-1 p-2 border border-app-border rounded-md bg-app-background text-app placeholder-app-secondary'
                  />
                  <Button
                    intent={VisualIntent.Primary}
                    onClick={handleAddTag}
                    disabled={!banForm.newTag.trim()}
                  >
                    Add
                  </Button>
                </div>
                {banForm.tags.length > 0 && (
                  <div className='flex flex-wrap gap-2'>
                    {banForm.tags.map((tag, index) => (
                      <span
                        key={index}
                        className='inline-flex items-center gap-1 px-2 py-1 text-xs bg-app-background text-app rounded-md border border-app-border'
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className='text-app-secondary hover:text-app ml-1'
                          aria-label={`Remove ${tag} tag`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className='flex gap-3 pt-2'>
                <Button
                  intent={VisualIntent.Secondary}
                  onClick={handleCancelBan}
                  className='flex-1'
                >
                  Cancel
                </Button>
                <Button
                  intent={VisualIntent.Secondary}
                  className='flex-1 !bg-red-400 hover:!bg-red-500 focus:!ring-red-400'
                  onClick={handleConfirmBan}
                >
                  Confirm Ban
                </Button>
              </div>
            </div>
          )}

          {/* Ozone Actions Section */}
          <h4 className='text-md font-semibold text-app'>Ozone Actions</h4>
          <div className='space-y-3'>

              <div className='space-y-4 pt-2'>
                <div>
                  <select
                    value={ozoneAction.type}
                    onChange={(e) => handleOzoneTypeChange(e.target.value as ModerationEventType)}
                    disabled={ozoneAction.loading}
                    className='w-full p-2 text-sm border border-app-border rounded-md bg-app-background text-app'
                  >
                    <option value="acknowledge">Acknowledge</option>
                    <option value="escalate">Escalate</option>
                    <option value="comment">Add Comment</option>
                    <option value="takedown">Takedown</option>
                    <option value="reverseTakedown">Reverse Takedown</option>
                    <option value="label">Add Labels</option>
                    <option value="tag">Add Tags</option>
                  </select>
                </div>

                {ozoneAction.type && (
                  <div className='space-y-3 p-3 bg-app-background border border-app-border rounded-md'>
                    <h5 className='text-sm font-semibold text-app'>
                      {getActionLabel(ozoneAction.type)}
                    </h5>

                    {['takedown', 'reverseTakedown', 'acknowledge', 'escalate', 'comment', 'label', 'tag'].includes(ozoneAction.type) && (
                      <div>
                        <label className='text-xs font-medium text-app mb-1 block'>
                          Comment {ozoneAction.type === 'comment' ? '(required)' : '(optional)'}:
                        </label>
                        <textarea
                          value={ozoneAction.comment}
                          onChange={(e) => setOzoneAction(prev => ({ ...prev, comment: e.target.value }))}
                          placeholder='Enter comment...'
                          className='w-full p-2 text-sm border border-gray-200 rounded-md bg-white text-gray-800 placeholder-gray-400 resize-none'
                          rows={2}
                        />
                      </div>
                    )}

                    {ozoneAction.type === 'takedown' && (
                      <div>
                        <label className='text-xs font-medium text-gray-700 mb-1 block'>
                          Duration in hours (optional):
                        </label>
                        <input
                          type='number'
                          value={ozoneAction.durationInHours}
                          onChange={(e) => setOzoneAction(prev => ({ ...prev, durationInHours: e.target.value }))}
                          placeholder='e.g., 168 for 1 week'
                          className='w-full p-2 text-sm border border-gray-200 rounded-md bg-white text-gray-800 placeholder-gray-400'
                        />
                      </div>
                    )}

                    {ozoneAction.type === 'comment' && (
                      <div className='flex items-center gap-2'>
                        <input
                          type='checkbox'
                          id='sticky-comment'
                          checked={ozoneAction.sticky}
                          onChange={(e) => setOzoneAction(prev => ({ ...prev, sticky: e.target.checked }))}
                          className='rounded border-gray-300'
                        />
                        <label htmlFor='sticky-comment' className='text-xs text-gray-700'>
                          Make comment sticky (pinned)
                        </label>
                      </div>
                    )}

                    {ozoneAction.type === 'label' && (
                      <>
                        <div>
                          <label className='text-xs font-medium text-gray-700 mb-1 block'>Add labels:</label>
                          <input
                            type='text'
                            value={ozoneAction.newLabel}
                            onChange={(e) => setOzoneAction(prev => ({ ...prev, newLabel: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && ozoneAction.newLabel.trim()) {
                                e.preventDefault();
                                if (!ozoneAction.createLabelVals.includes(ozoneAction.newLabel.trim())) {
                                  setOzoneAction(prev => ({
                                    ...prev,
                                    createLabelVals: [...prev.createLabelVals, prev.newLabel.trim()],
                                    newLabel: '',
                                  }));
                                }
                              }
                            }}
                            placeholder='Type label and press Enter'
                            className='w-full p-2 text-sm border border-gray-200 rounded-md bg-white text-gray-800 placeholder-gray-400'
                          />
                          {ozoneAction.createLabelVals.length > 0 && (
                            <div className='flex flex-wrap gap-1 mt-2'>
                              {ozoneAction.createLabelVals.map((label, idx) => (
                                <span key={idx} className='inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-700 rounded'>
                                  +{label}
                                  <button onClick={() => setOzoneAction(prev => ({ ...prev, createLabelVals: prev.createLabelVals.filter((_, i) => i !== idx) }))} className='ml-1 text-green-500 hover:text-green-700'>×</button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className='text-xs font-medium text-gray-700 mb-1 block'>Remove labels:</label>
                          <input
                            type='text'
                            placeholder='Type label to remove and press Enter'
                            className='w-full p-2 text-sm border border-gray-200 rounded-md bg-white text-gray-800 placeholder-gray-400'
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const val = (e.target as HTMLInputElement).value.trim();
                                if (val && !ozoneAction.negateLabelVals.includes(val)) {
                                  setOzoneAction(prev => ({ ...prev, negateLabelVals: [...prev.negateLabelVals, val] }));
                                  (e.target as HTMLInputElement).value = '';
                                }
                              }
                            }}
                          />
                          {ozoneAction.negateLabelVals.length > 0 && (
                            <div className='flex flex-wrap gap-1 mt-2'>
                              {ozoneAction.negateLabelVals.map((label, idx) => (
                                <span key={idx} className='inline-flex items-center px-2 py-1 text-xs bg-red-100 text-red-700 rounded'>
                                  -{label}
                                  <button onClick={() => setOzoneAction(prev => ({ ...prev, negateLabelVals: prev.negateLabelVals.filter((_, i) => i !== idx) }))} className='ml-1 text-red-500 hover:text-red-700'>×</button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {ozoneAction.type === 'tag' && (
                      <>
                        <div>
                          <label className='text-xs font-medium text-gray-700 mb-1 block'>Add tags:</label>
                          <input
                            type='text'
                            value={ozoneAction.newTag}
                            onChange={(e) => setOzoneAction(prev => ({ ...prev, newTag: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && ozoneAction.newTag.trim()) {
                                e.preventDefault();
                                if (!ozoneAction.addTags.includes(ozoneAction.newTag.trim())) {
                                  setOzoneAction(prev => ({ ...prev, addTags: [...prev.addTags, prev.newTag.trim()], newTag: '' }));
                                }
                              }
                            }}
                            placeholder='Type tag and press Enter'
                            className='w-full p-2 text-sm border border-gray-200 rounded-md bg-white text-gray-800 placeholder-gray-400'
                          />
                          {ozoneAction.addTags.length > 0 && (
                            <div className='flex flex-wrap gap-1 mt-2'>
                              {ozoneAction.addTags.map((tag, idx) => (
                                <span key={idx} className='inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-700 rounded'>
                                  +{tag}
                                  <button onClick={() => setOzoneAction(prev => ({ ...prev, addTags: prev.addTags.filter((_, i) => i !== idx) }))} className='ml-1 text-green-500 hover:text-green-700'>×</button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className='text-xs font-medium text-gray-700 mb-1 block'>Remove tags:</label>
                          <input
                            type='text'
                            placeholder='Type tag to remove and press Enter'
                            className='w-full p-2 text-sm border border-gray-200 rounded-md bg-white text-gray-800 placeholder-gray-400'
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const val = (e.target as HTMLInputElement).value.trim();
                                if (val && !ozoneAction.removeTags.includes(val)) {
                                  setOzoneAction(prev => ({ ...prev, removeTags: [...prev.removeTags, val] }));
                                  (e.target as HTMLInputElement).value = '';
                                }
                              }
                            }}
                          />
                          {ozoneAction.removeTags.length > 0 && (
                            <div className='flex flex-wrap gap-1 mt-2'>
                              {ozoneAction.removeTags.map((tag, idx) => (
                                <span key={idx} className='inline-flex items-center px-2 py-1 text-xs bg-red-100 text-red-700 rounded'>
                                  -{tag}
                                  <button onClick={() => setOzoneAction(prev => ({ ...prev, removeTags: prev.removeTags.filter((_, i) => i !== idx) }))} className='ml-1 text-red-500 hover:text-red-700'>×</button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    <div className='flex gap-2 pt-2'>
                      <Button intent={VisualIntent.Secondary} onClick={resetOzoneAction} disabled={ozoneAction.loading} className='flex-1'>
                        Cancel
                      </Button>
                      <Button intent={VisualIntent.Primary} onClick={handleOzoneSubmit} disabled={!canSubmitOzoneAction()} className='flex-1'>
                        {ozoneAction.loading ? 'Submitting...' : `Submit`}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
          </div>
          </div>

          {/* Right Column - Moderation Info */}
          <div className='flex-1 min-w-0 space-y-4 overflow-y-auto'>
            {/* Moderation Data Section */}
        {loadingModerationData ? (
          <div className='space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
            <h4 className='text-md font-semibold text-blue-800'>Loading Moderation History...</h4>
            <div className='flex items-center space-x-2'>
              <div className='animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent'></div>
              <span className='text-sm text-blue-600'>Fetching additional profile data...</span>
            </div>
          </div>
        ) : moderationData?.error ? (
          <div className='space-y-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
            <h4 className='text-md font-semibold text-yellow-800'>Moderation Data Unavailable</h4>
            <p className='text-sm text-yellow-600'>
              {moderationData.error}
            </p>
          </div>
        ) : moderationData ? (
          <>
            {/* Subject Status Section */}
            {moderationData.subjectStatus && (
              <div className='space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                <h4 className='text-md font-semibold text-blue-800'>Subject Status</h4>

                {moderationData.subjectStatus.reviewState && (
                  <div>
                    <span className='text-sm font-medium text-blue-700'>Review State:</span>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-md ${
                      moderationData.subjectStatus.reviewState.includes('Escalated')
                        ? 'bg-orange-100 text-orange-700'
                        : moderationData.subjectStatus.reviewState.includes('Closed')
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {moderationData.subjectStatus.reviewState.split('#').pop()}
                    </span>
                  </div>
                )}

                {moderationData.subjectStatus.takendown && (
                  <div className='flex items-center'>
                    <span className='px-2 py-1 text-xs bg-red-100 text-red-700 rounded-md'>
                      Account Taken Down
                    </span>
                  </div>
                )}

                {moderationData.subjectStatus.appealed && (
                  <div className='flex items-center'>
                    <span className='px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-md'>
                      Appeal Pending
                    </span>
                  </div>
                )}

                {moderationData.subjectStatus.tags && moderationData.subjectStatus.tags.length > 0 && (
                  <div>
                    <span className='text-sm font-medium text-blue-700'>Tags:</span>
                    <div className='flex flex-wrap gap-2 mt-1'>
                      {moderationData.subjectStatus.tags.map((tag, index) => (
                        <span
                          key={index}
                          className='px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md border border-blue-200'
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {moderationData.subjectStatus.comment && (
                  <div>
                    <span className='text-sm font-medium text-blue-700'>Notes:</span>
                    <p className='text-sm text-blue-600 mt-1 italic'>
                      &quot;{moderationData.subjectStatus.comment}&quot;
                    </p>
                  </div>
                )}

                <div className='grid grid-cols-2 gap-2 text-xs text-blue-600'>
                  {moderationData.subjectStatus.lastReviewedAt && (
                    <div>
                      <span className='font-medium'>Last Reviewed:</span>{' '}
                      {new Date(moderationData.subjectStatus.lastReviewedAt).toLocaleString()}
                    </div>
                  )}
                  {moderationData.subjectStatus.lastReportedAt && (
                    <div>
                      <span className='font-medium'>Last Reported:</span>{' '}
                      {new Date(moderationData.subjectStatus.lastReportedAt).toLocaleString()}
                    </div>
                  )}
                  {moderationData.subjectStatus.createdAt && (
                    <div>
                      <span className='font-medium'>Created:</span>{' '}
                      {new Date(moderationData.subjectStatus.createdAt).toLocaleString()}
                    </div>
                  )}
                  {moderationData.subjectStatus.updatedAt && (
                    <div>
                      <span className='font-medium'>Updated:</span>{' '}
                      {new Date(moderationData.subjectStatus.updatedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent Events Section */}
            {moderationData.recentEvents && moderationData.recentEvents.length > 0 && (
              <div className='space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-lg'>
                <h4 className='text-md font-semibold text-gray-800'>
                  Recent Events ({moderationData.recentEvents.length})
                </h4>
                <div className='space-y-2'>
                  {moderationData.recentEvents.map((event) => (
                    <div
                      key={event.id}
                      className='p-3 bg-white border border-gray-100 rounded-md'
                    >
                      <div className='flex justify-between items-start'>
                        <span className={`px-2 py-1 text-xs rounded-md ${
                          event.eventType.includes('Escalate')
                            ? 'bg-orange-100 text-orange-700'
                            : event.eventType.includes('Report')
                            ? 'bg-red-100 text-red-700'
                            : event.eventType.includes('Tag')
                            ? 'bg-blue-100 text-blue-700'
                            : event.eventType.includes('Acknowledge')
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {event.eventType.split('#').pop()?.replace('modEvent', '')}
                        </span>
                        <span className='text-xs text-gray-500'>
                          {new Date(event.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {event.creatorHandle && (
                        <p className='text-xs text-gray-600 mt-1'>
                          By: @{event.creatorHandle}
                        </p>
                      )}
                      {event.comment && (
                        <p className='text-sm text-gray-700 mt-2 italic'>
                          &quot;{event.comment}&quot;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}

        {/* Ban Details Section */}
        {banStatus.isBanned && banStatus.banInfo && (
          <div className='space-y-3 p-4 bg-red-50 border border-red-200 rounded-lg'>
            <h4 className='text-md font-semibold text-red-800'>User is Banned</h4>

            {banStatus.banInfo.reason && (
              <div>
                <span className='text-sm font-medium text-red-700'>Reason:</span>
                <p className='text-sm text-red-600 mt-1'>{banStatus.banInfo.reason}</p>
              </div>
            )}

            {banStatus.banInfo.tags && banStatus.banInfo.tags.length > 0 && (
              <div>
                <span className='text-sm font-medium text-red-700'>Tags:</span>
                <div className='flex flex-wrap gap-2 mt-1'>
                  {banStatus.banInfo.tags.map((tag, index) => (
                    <span
                      key={index}
                      className='px-2 py-1 text-xs bg-red-100 text-red-700 rounded-md border border-red-200'
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {banStatus.banInfo.createdAt && (
              <div>
                <span className='text-sm font-medium text-red-700'>Banned on:</span>
                <p className='text-sm text-red-600 mt-1'>
                  {new Date(banStatus.banInfo.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        )}
          </div>
        </div>
      </div>
    </Modal>
  );
};