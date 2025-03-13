import { ModAction } from '../types/moderation';

export const ADMIN_ACTIONS: Partial<ModAction>[] = [
  'mod_promote',
  'mod_demote',
  'user_unban',
  'user_ban',
];
