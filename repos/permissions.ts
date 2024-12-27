import { SupabaseInstance } from '@/repos/supabase';
import { UserRole } from '@/types/user';

export class PermissionsManager {
  // Check if a user has sufficient permissions to perform an action
  static async canPerformAction(
    userDid: string,
    action: 'create_mod' | 'remove_mod' | 'delete_post' | 'ban_user',
    feedUri: string
  ): Promise<boolean> {
    // Fetch the user's role for the specified feed
    const feedRole = await this.getFeedRole(userDid, feedUri);

    switch (action) {
      case 'create_mod':
      case 'remove_mod':
        // Only admins can create or remove mods
        return feedRole === 'admin';
      case 'delete_post':
        // Both mods and admins can delete posts
        return feedRole === 'mod' || feedRole === 'admin';
      case 'ban_user':
        // Both mods and admins can ban users
        return feedRole === 'mod' || feedRole === 'admin';
      default:
        return false;
    }
  }

  static async getFeedRole(
    userDid: string,
    feedUri: string
  ): Promise<UserRole> {
    const { data, error } = await SupabaseInstance.from('feed_permissions')
      .select('role')
      .eq('user_did', userDid)
      .eq('feed_uri', feedUri)
      .single();

    if (error || !data) return 'user';
    return data.role;
  }

  static async setFeedRole(
    targetUserDid: string,
    feedUri: string,
    role: UserRole,
    setByUserDid: string,
    feedName: string
  ): Promise<boolean> {
    console.log('Setting feed role:', {
      targetUserDid,
      feedUri,
      role,
      setByUserDid,
      feedName,
    });

    const canSetRole = await this.canPerformAction(
      setByUserDid,
      'create_mod',
      feedUri
    );
    if (!canSetRole) {
      console.error('Permission denied to set feed role:', {
        setByUserDid,
        feedUri,
      });
      return false;
    }

    const { error } = await SupabaseInstance.from('feed_permissions').upsert({
      user_did: targetUserDid,
      feed_uri: feedUri,
      feed_name: feedName || 'Unnamed Feed',
      role: role,
      created_by: setByUserDid,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error upserting feed role:', error, {
        targetUserDid,
        feedUri,
        role,
        setByUserDid,
        feedName,
      });
      return false;
    }

    return true;
  }
}
