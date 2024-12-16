// repos/permissions.ts
import { SupabaseInstance } from '@/repos/supabase';
import { UserRole } from '@/types/user';

export class PermissionsManager {
  // Check if a user has sufficient permissions to perform an action
  static async canPerformAction(
    userDid: string,
    action: 'create_mod' | 'remove_mod' | 'delete_post' | 'ban_user',
    feedDid?: string,
    feedName?: string
  ): Promise<boolean> {
    // Get user's global role
    const globalRole = await this.getGlobalRole(userDid);

    // Admins can do everything
    if (globalRole === 'admin') return true;

    // If this is a feed-specific action, check feed permissions
    if (feedDid && feedName) {
      const feedRole = await this.getFeedRole(userDid, feedDid, feedName);

      switch (action) {
        case 'create_mod':
          // Only admins can create mods
          return false;
        case 'remove_mod':
          // Only admins can remove mods
          return false;
        case 'delete_post':
          // Both mods and admins can delete posts
          return feedRole === 'mod' || feedRole === 'admin';
        case 'ban_user':
          // Only admins and mods can ban users
          return feedRole === 'mod' || feedRole === 'admin';
        default:
          return false;
      }
    }

    return false;
  }

  static async getGlobalRole(userDid: string): Promise<UserRole> {
    const { data, error } = await SupabaseInstance.from('user_roles')
      .select('role')
      .eq('user_did', userDid)
      .single();

    if (error || !data) return 'user';
    return data.role;
  }

  static async getFeedRole(
    userDid: string,
    feedDid: string,
    feedName: string
  ): Promise<UserRole> {
    const { data, error } = await SupabaseInstance.from('feed_permissions')
      .select('role')
      .eq('user_did', userDid)
      .eq('feed_did', feedDid)
      .eq('feed_name', feedName)
      .single();

    if (error || !data) return 'user';
    return data.role;
  }

  static async setGlobalRole(
    targetUserDid: string,
    role: UserRole,
    setByUserDid: string
  ): Promise<boolean> {
    // Check if the user setting the role has permission
    const setByRole = await this.getGlobalRole(setByUserDid);
    if (setByRole !== 'admin') return false;

    const { error } = await SupabaseInstance.from('user_roles').upsert({
      user_did: targetUserDid,
      role: role,
      created_by: setByUserDid,
    });

    return !error;
  }

  static async setFeedRole(
    targetUserDid: string,
    feedDid: string,
    feedName: string,
    role: UserRole,
    setByUserDid: string
  ): Promise<boolean> {
    // Check if the user setting the role has permission
    const canSetRole = await this.canPerformAction(
      setByUserDid,
      'create_mod',
      feedDid,
      feedName
    );
    if (!canSetRole) return false;

    const { error } = await SupabaseInstance.from('feed_permissions').upsert({
      user_did: targetUserDid,
      feed_did: feedDid,
      feed_name: feedName,
      role: role,
      created_by: setByUserDid,
    });

    return !error;
  }
}
