import { UserRole } from '@/lib/types/permission';
import { buildFeedPermissions, determineUserRolesByFeed } from '../permission';

describe('buildFeedPermissions', () => {
  it('combines created feed permissions with existing mod permissions', () => {
    const userDid = 'user123';
    const createdFeeds = [{ uri: 'at://feed/123', displayName: 'Feed 123' }];
    const existingPermissions = [
      {
        role: 'mod' as UserRole,
        feed_uri: 'at://feed/456',
        feed_name: 'Feed 456',
      },
      {
        role: 'user' as UserRole,
        feed_uri: 'at://feed/789',
        feed_name: 'Feed 789',
      },
    ];

    const permissions = buildFeedPermissions(
      userDid,
      createdFeeds,
      existingPermissions
    );

    expect(permissions).toEqual([
      {
        user_did: 'user123',
        feed_uri: 'at://feed/123',
        feed_name: 'Feed 123',
        role: 'admin',
        created_by: 'user123',
        created_at: expect.any(String),
      },
      {
        user_did: 'user123',
        role: 'mod',
        feed_uri: 'at://feed/456',
        feed_name: 'Feed 456',
      },
      {
        user_did: 'user123',
        role: 'user',
        feed_uri: 'at://feed/789',
        feed_name: 'Feed 789',
      },
    ]);
  });

  it('returns an empty array when there are no created feeds or existing permissions', () => {
    const permissions = buildFeedPermissions('user123', [], []);
    expect(permissions).toEqual([]);
  });

  it('prioritizes admin role over mod role for the same feed', () => {
    const userDid = 'user123';
    const createdFeeds = [{ uri: 'at://feed/123', displayName: 'Feed 123' }];
    const existingPermissions = [
      {
        role: 'mod' as UserRole,
        feed_uri: 'at://feed/123',
        feed_name: 'Feed 123',
      },
    ];

    const permissions = buildFeedPermissions(
      userDid,
      createdFeeds,
      existingPermissions
    );

    expect(permissions).toEqual([
      {
        user_did: 'user123',
        feed_uri: 'at://feed/123',
        feed_name: 'Feed 123',
        role: 'admin',
        created_by: 'user123',
        created_at: expect.any(String),
      },
    ]);
  });

  it('handles feeds with invalid permissions gracefully', () => {
    const userDid = 'user123';
    const createdFeeds = [{ uri: 'at://feed/123', displayName: 'Feed 123' }];
    const existingPermissions = [
      {
        role: 'user' as UserRole,
        feed_uri: '',
        feed_name: '',
      },
    ];

    expect(() => {
      buildFeedPermissions(userDid, createdFeeds, existingPermissions);
    }).toThrow(
      'Invalid permission data: Each permission must have a valid feed_uri, feed_name, and role.'
    );
  });

  it('retains the highest-priority role when duplicate roles exist for the same feed', () => {
    const userDid = 'user123';
    const createdFeeds: { uri: string; displayName?: string }[] = [];
    const existingPermissions = [
      {
        role: 'user' as UserRole,
        feed_uri: 'at://feed/123',
        feed_name: 'Feed 123',
      },
      {
        role: 'mod' as UserRole,
        feed_uri: 'at://feed/123',
        feed_name: 'Feed 123',
      },
    ];

    const permissions = buildFeedPermissions(
      userDid,
      createdFeeds,
      existingPermissions
    );

    expect(permissions).toEqual([
      {
        user_did: 'user123',
        role: 'mod',
        feed_uri: 'at://feed/123',
        feed_name: 'Feed 123',
      },
    ]);
  });
});

describe('determineUserRolesByFeed', () => {
  it('assigns admin role for created feeds and respects existing permissions', () => {
    const createdFeeds = [{ uri: 'at://feed/123', displayName: 'Feed 123' }];
    const existingPermissions = [
      {
        role: 'mod' as UserRole,
        feed_uri: 'at://feed/456',
        feed_name: 'Feed 456',
      },
      {
        role: 'user' as UserRole,
        feed_uri: 'at://feed/789',
        feed_name: 'Feed 789',
      },
    ];

    const rolesByFeed = determineUserRolesByFeed(
      existingPermissions,
      createdFeeds
    );

    expect(rolesByFeed).toEqual({
      'at://feed/123': {
        role: 'admin',
        displayName: 'Feed 123',
        feedUri: 'at://feed/123',
      },
      'at://feed/456': {
        role: 'mod',
        displayName: 'Feed 456',
        feedUri: 'at://feed/456',
      },
      'at://feed/789': {
        role: 'user',
        displayName: 'Feed 789',
        feedUri: 'at://feed/789',
      },
    });
  });

  it('prioritizes roles correctly when duplicate entries exist for the same feed', () => {
    const createdFeeds: { uri: string; displayName: string }[] = [];
    const existingPermissions = [
      {
        role: 'user' as UserRole,
        feed_uri: 'at://feed/123',
        feed_name: 'Feed 123',
      },
      {
        role: 'mod' as UserRole,
        feed_uri: 'at://feed/123',
        feed_name: 'Feed 123',
      },
    ];

    const rolesByFeed = determineUserRolesByFeed(
      existingPermissions,
      createdFeeds
    );

    expect(rolesByFeed).toEqual({
      'at://feed/123': {
        role: 'mod',
        displayName: 'Feed 123',
        feedUri: 'at://feed/123',
      },
    });
  });

  it('assigns admin role to created feeds even if they exist in permissions with lower roles', () => {
    const createdFeeds = [{ uri: 'at://feed/123', displayName: 'Feed 123' }];
    const existingPermissions = [
      {
        role: 'user' as UserRole,
        feed_uri: 'at://feed/123',
        feed_name: 'Feed 123',
      },
    ];

    const rolesByFeed = determineUserRolesByFeed(
      existingPermissions,
      createdFeeds
    );

    expect(rolesByFeed).toEqual({
      'at://feed/123': {
        role: 'admin',
        displayName: 'Feed 123',
        feedUri: 'at://feed/123',
      },
    });
  });

  it('handles an empty list of permissions gracefully', () => {
    const createdFeeds: { uri: string; displayName?: string }[] = [];
    const existingPermissions: {
      role: UserRole;
      feed_uri: string;
      feed_name: string;
    }[] = [];

    const rolesByFeed = determineUserRolesByFeed(
      existingPermissions,
      createdFeeds
    );

    expect(rolesByFeed).toEqual({});
  });

  it('handles a mix of valid and invalid permissions correctly', () => {
    const createdFeeds = [{ uri: 'at://feed/123', displayName: 'Feed 123' }];
    const existingPermissions = [
      {
        role: 'mod' as UserRole,
        feed_uri: 'at://feed/456',
        feed_name: 'Feed 456',
      },
      {
        role: null as unknown as UserRole,
        feed_uri: 'at://feed/789',
        feed_name: '',
      },
    ];

    const rolesByFeed = determineUserRolesByFeed(
      existingPermissions,
      createdFeeds
    );

    expect(rolesByFeed).toEqual({
      'at://feed/123': {
        role: 'admin',
        displayName: 'Feed 123',
        feedUri: 'at://feed/123',
      },
      'at://feed/456': {
        role: 'mod',
        displayName: 'Feed 456',
        feedUri: 'at://feed/456',
      },
      'at://feed/789': {
        displayName: 'Unknown Feed',
        feedUri: 'at://feed/789',
        role: 'user',
      },
    });
  });
});
