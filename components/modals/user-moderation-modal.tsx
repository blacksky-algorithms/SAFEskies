'use client';

import React, { useState, useEffect, useContext } from 'react';
import { Modal } from '@/components/modals';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { Button } from '@/components/button';
import { OptimizedImage } from '@/components/optimized-image';
import { VisualIntent } from '@/enums/styles';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { checkUserBanStatus, banUser, unbanUser, BannedFromTV, checkUserMuteStatus, muteUser, unmuteUser } from '@/repos/moderation';
import { ToastContext } from '@/contexts/toast-context';

interface UserModerationModalProps {
  user: ProfileViewBasic | null;
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
  }>({
    isBanned: false,
  });

  const [muteStatus, setMuteStatus] = useState({
    isMuted: false,
  });

  const [banForm, setBanForm] = useState({
    showForm: false,
    reason: '',
    tags: [] as string[],
    newTag: '',
  });

  // Check ban and mute status when modal opens
  useEffect(() => {
    if (user?.did) {
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
          toastContext?.toast({
            title: 'Error',
            message: 'Failed to check user ban status',
            intent: VisualIntent.Error,
          });
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
          toastContext?.toast({
            title: 'Error',
            message: 'Failed to check user mute status',
            intent: VisualIntent.Error,
          });
        });
    }
  }, [user?.did, toastContext]);

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

  return (
    <Modal
      id={MODAL_INSTANCE_IDS.USER_MODERATION}
      title='User Moderation'
      onClose={onClose}
      size='medium'
    >
      <div className='space-y-6'>
        {/* User Profile Section */}
        <div className='flex items-center space-x-4 p-4 bg-app-secondary rounded-lg'>
          {user.avatar ? (
            <OptimizedImage
              src={user.avatar}
              alt={`Avatar of ${user.handle}`}
              className='w-16 h-16 rounded-full'
            />
          ) : (
            <div className='w-16 h-16 bg-app-background rounded-full flex items-center justify-center'>
              <span className='text-app text-xl font-semibold'>
                {(user.displayName || user.handle).charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className='flex-1'>
            <h3 className='text-lg font-semibold text-app'>
              {user.displayName || user.handle}
            </h3>
            <p className='text-app'>@{user.handle}</p>
            <p className='text-sm text-app font-mono mt-1'>
              {user.did}
            </p>
          </div>
        </div>

        {/* Ban Details Section */}
        {banStatus.isBanned && banStatus.banInfo && (
          <div className='space-y-3 p-4 bg-red-50 border border-red-200 rounded-lg'>
            <h4 className='text-md font-semibold text-red-800'>🚫 User is Banned</h4>

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

        {/* Ban Form Section */}
        {banForm.showForm && (
          <div className='space-y-4 p-4 border border-app-border rounded-lg bg-app-background'>
            <h4 className='text-md font-semibold text-app'>🚫 Ban User Details</h4>

            {/* Reason Input */}
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

            {/* Tags Input */}
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

              {/* Tag Pills */}
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

            {/* Form Action Buttons */}
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
                🚫 Confirm Ban
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!banForm.showForm && (
          <div className='space-y-3'>
            <h4 className='text-md font-semibold text-app'>Moderation Actions</h4>

            <div className='grid grid-cols-2 gap-3'>
              <Button
                intent={VisualIntent.Secondary}
                className="!bg-red-400 hover:!bg-red-500 focus:!ring-red-400"
                onClick={banStatus.isBanned ? handleBanUser : handleShowBanForm}
              >
                🚫 {banStatus.isBanned ? 'Unban User' : 'Ban User'}
              </Button>

              <Button
                intent={VisualIntent.Secondary}
                onClick={handleMuteUser}
              >
                🔇 {muteStatus.isMuted ? 'Unmute User' : 'Mute User'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};