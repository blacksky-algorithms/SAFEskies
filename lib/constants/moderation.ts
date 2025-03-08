import { ModAction } from '../types/moderation';

export type ModerationService = {
  label: 'Blacksky Moderation Service' | 'Ozone Moderation Service';
  value: 'blacksky' | 'ozone';
};

export const ADMIN_ACTIONS: Partial<ModAction>[] = [
  'mod_promote',
  'mod_demote',
  'user_unban',
  'user_ban',
];
