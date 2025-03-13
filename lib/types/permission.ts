export type UserRole = 'admin' | 'mod' | 'user';

export type FeedRoleInfo = {
  type: UserRole;
  displayName: string;
  uri: string;
};

export type FeedPermission = {
  role: UserRole;
  uri: string;
  feed_name: string;
  user_did: string;
  created_by?: string;
  created_at?: string;
};
