import { ComAtprotoModerationDefs } from '@atproto/api';

export const REPORT_OPTIONS = [
  {
    id: 'misleading',
    title: 'Misleading Post',
    description: 'Impersonation, misinformation, or false claims',
    reason: ComAtprotoModerationDefs.REASONMISLEADING,
  },
  {
    id: 'spam',
    title: 'Spam',
    description: 'Excessive mentions or replies',
    reason: ComAtprotoModerationDefs.REASONSPAM,
  },
  {
    id: 'nsfw',
    title: 'Unwanted Sexual Content',
    description: 'Nudity or adult content not labeled as such',
    reason: ComAtprotoModerationDefs.REASONSEXUAL,
  },
  {
    id: 'behavior',
    title: 'Anti-Social Behavior',
    description: 'Harassment, trolling, or intolerance',
    reason: ComAtprotoModerationDefs.REASONRUDE,
  },
  {
    id: 'illegal',
    title: 'Illegal and Urgent',
    description: 'Glaring violations of law or terms of service',
    reason: ComAtprotoModerationDefs.REASONVIOLATION,
  },
  {
    id: 'other',
    title: 'Other',
    description: 'An issue not included in these options',
    reason: ComAtprotoModerationDefs.REASONOTHER,
  },
] as const;

export type ModerationService = {
  label: 'Blacksky Moderation Service' | 'Ozone Moderation Service';
  value: 'blacksky' | 'ozone';
};

export const MODERATION_SERVICES = [
  { label: 'Blacksky Moderation Service', value: 'blacksky' },
  { label: 'Ozone Moderation Service', value: 'ozone' },
].filter((service) => service.value === 'blacksky');
