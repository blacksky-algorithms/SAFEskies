import { REPORT_OPTIONS } from '@/lib/constants/moderation';

export type ModAction =
  | 'post_delete'
  | 'post_restore'
  | 'user_ban'
  | 'user_unban'
  | 'mod_promote'
  | 'mod_demote';

export type ReportOption = (typeof REPORT_OPTIONS)[number];
