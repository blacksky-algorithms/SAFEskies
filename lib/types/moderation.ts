import { PostRecord } from '@atproto/api';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { Feed } from '@atproto/api/dist/client/types/app/bsky/feed/describeFeedGenerator';
import { User } from './user';

export interface PromoteModState {
  selectedUser: ProfileViewBasic | null;
  selectedFeeds: Feed[];
  disabledFeeds: string[];
  isLoading: boolean;
  error: string | null;
}

export type ModAction =
  | 'post_delete'
  | 'post_restore'
  | 'user_ban'
  | 'user_unban'
  | 'mod_promote'
  | 'mod_demote';

export interface ReportOption {
  id: string;
  title: string;
  description: string;
  reason: string;
}

export interface ReportData {
  targetedPostUri?: string;
  reason: string;
  toServices: { label: string; value: string }[];
  targetedUserDid?: string;
  uri: string;
  feedName?: string;
  additionalInfo?: string;
  action: ModAction;
  targetedPost?: PostRecord;
  targetedProfile?: User;
}

export interface ModerationService {
  value: 'blacksky' | 'ozone';
  label: 'Blacksky Moderation Service' | 'Ozone Moderation Service';
  admin_did: string | null;
}

export interface SubjectStatus {
  reviewState?: string;
  comment?: string;
  tags?: string[];
  takendown?: boolean;
  appealed?: boolean;
  lastReviewedAt?: string;
  lastReviewedBy?: string;
  lastReportedAt?: string;
  muteUntil?: string;
  suspendUntil?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ModerationEvent {
  id: number;
  eventType: string;
  createdBy: string;
  createdAt: string;
  creatorHandle?: string;
  comment?: string;
}

export interface ProfileModerationResponse {
  did: string;
  subjectStatus?: SubjectStatus | null;
  recentEvents?: ModerationEvent[];
  profile?: {
    handle: string;
    displayName?: string;
    avatar?: string;
  };
  error?: string;
}

export interface EscalatedUserData {
  did: string;
  handle?: string;
  displayName?: string;
  avatar?: string | null;
}

export interface EscalatedAccountItem {
  did: string;
  handle?: string;
  displayName?: string;
  avatar?: string | null;
  type: 'account';
}

export interface EscalatedPostItem {
  did: string;
  handle?: string;
  displayName?: string;
  avatar?: string | null;
  type: 'post';
  postUri: string;
  postCid: string;
}

export type EscalatedItem = EscalatedAccountItem | EscalatedPostItem;

export interface EscalatedItemsResponse {
  items: EscalatedItem[];
  cursor?: string;
  hasMore: boolean;
}

// Ozone moderation event types
export type ModerationEventType =
  | 'takedown'
  | 'reverseTakedown'
  | 'acknowledge'
  | 'escalate'
  | 'comment'
  | 'label'
  | 'tag';

export interface EmitEventResponse {
  success: boolean;
  eventId: number;
  message: string;
}

export interface TakedownEventParams {
  comment?: string;
  durationInHours?: number;
  acknowledgeAccountSubjects?: boolean;
  policies?: string[];
}

export interface CommentEventParams {
  comment: string;
  sticky?: boolean;
}

export interface LabelEventParams {
  createLabelVals: string[];
  negateLabelVals: string[];
  comment?: string;
  durationInHours?: number;
}

export interface TagEventParams {
  add: string[];
  remove: string[];
  comment?: string;
}

export interface SimpleEventParams {
  comment?: string;
}

export type ModerationEventParams =
  | TakedownEventParams
  | CommentEventParams
  | LabelEventParams
  | TagEventParams
  | SimpleEventParams;
