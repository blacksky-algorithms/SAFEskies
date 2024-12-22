import { buildFeedPermissions, determineUserRole } from '@/utils/roles';
import { UserRole } from '@/types/user';

describe('determineUserRole', () => {
  it('returns admin if the user has created feeds', () => {
    const existingPermissions: { role: UserRole; feed_did: string }[] = [];
    const createdFeeds: { did: string }[] = [{ did: 'feed123' }];
    const role = determineUserRole(existingPermissions, createdFeeds);
    expect(role).toBe('admin');
  });

  it('returns mod if the user has no created feeds but has mod permissions', () => {
    const existingPermissions: { role: UserRole; feed_did: string }[] = [
      { role: 'mod', feed_did: 'feed123' },
    ];
    const createdFeeds: { did: string }[] = [];
    const role = determineUserRole(existingPermissions, createdFeeds);
    expect(role).toBe('mod');
  });

  it('returns user if the user has no created feeds or mod permissions', () => {
    const existingPermissions: { role: UserRole; feed_did: string }[] = [];
    const createdFeeds: { did: string }[] = [];
    const role = determineUserRole(existingPermissions, createdFeeds);
    expect(role).toBe('user');
  });
});

describe('buildFeedPermissions', () => {
  describe('Basic Functionality', () => {
    it('combines created feed permissions with existing mod permissions', () => {
      const userDid = 'user123';
      const createdFeeds = [{ did: 'feed123', uri: 'at://feed/123' }];
      const existingPermissions: {
        role: UserRole;
        feed_did: string;
        feed_name: string;
      }[] = [
        { role: 'mod', feed_did: 'feed456', feed_name: '456' },
        { role: 'user', feed_did: 'feed789', feed_name: '789' },
      ];

      const permissions = buildFeedPermissions(
        userDid,
        createdFeeds,
        existingPermissions
      );

      expect(permissions).toEqual([
        {
          user_did: 'user123',
          feed_did: 'feed123',
          feed_name: '123',
          role: 'admin',
          created_by: 'user123',
          created_at: expect.any(String),
        },
        {
          role: 'mod',
          feed_did: 'feed456',
          feed_name: '456',
        },
        {
          role: 'user',
          feed_did: 'feed789',
          feed_name: '789',
        },
      ]);
    });

    it('returns an empty array when there are no created feeds or existing permissions', () => {
      const permissions = buildFeedPermissions('user123', [], []);
      expect(permissions).toEqual([]);
    });
  });

  describe('Role Prioritization', () => {
    it('assigns admin role when both admin and mod roles exist for the same feed', () => {
      const userDid = 'user123';
      const createdFeeds = [{ did: 'feed123', uri: 'at://feed/123' }];
      const existingPermissions: {
        role: UserRole;
        feed_did: string;
        feed_name: string;
      }[] = [{ role: 'mod', feed_did: 'feed123', feed_name: '123' }];

      const permissions = buildFeedPermissions(
        userDid,
        createdFeeds,
        existingPermissions
      );

      expect(permissions).toEqual([
        {
          user_did: 'user123',
          feed_did: 'feed123',
          feed_name: '123',
          role: 'admin',
          created_by: 'user123',
          created_at: expect.any(String),
        },
      ]);
    });

    it('ensures user role does not override mod or admin roles', () => {
      const userDid = 'user123';
      const createdFeeds = [{ did: 'feed123', uri: 'at://feed/123' }];
      const existingPermissions: {
        role: UserRole;
        feed_did: string;
        feed_name: string;
      }[] = [
        { role: 'user', feed_did: 'feed123', feed_name: '123' },
        { role: 'mod', feed_did: 'feed456', feed_name: '456' },
      ];

      const permissions = buildFeedPermissions(
        userDid,
        createdFeeds,
        existingPermissions
      );

      expect(permissions).toEqual([
        {
          user_did: 'user123',
          feed_did: 'feed123',
          feed_name: '123',
          role: 'admin',
          created_by: 'user123',
          created_at: expect.any(String),
        },
        {
          role: 'mod',
          feed_did: 'feed456',
          feed_name: '456',
        },
      ]);
    });

    it('prioritizes admin over mod and user roles for the same feed', () => {
      const userDid = 'user123';
      const createdFeeds: { did: string; uri: string }[] = [
        { did: 'feed123', uri: 'at://feed/123' },
      ];
      const existingPermissions: {
        role: UserRole;
        feed_did: string;
        feed_name: string;
      }[] = [
        { role: 'mod', feed_did: 'feed123', feed_name: '123' },
        { role: 'user', feed_did: 'feed123', feed_name: '123' },
      ];

      const permissions = buildFeedPermissions(
        userDid,
        createdFeeds,
        existingPermissions
      );

      expect(permissions).toEqual([
        {
          user_did: 'user123',
          feed_did: 'feed123',
          feed_name: '123',
          role: 'admin',
          created_by: 'user123',
          created_at: expect.any(String),
        },
      ]);
    });
  });

  describe('Error Handling', () => {
    it('throws an error for invalid user ID', () => {
      expect(() =>
        buildFeedPermissions('', [{ did: 'feed123', uri: 'at://feed/123' }], [])
      ).toThrow('Invalid user ID provided.');
    });

    it('throws an error for invalid createdFeeds', () => {
      expect(() =>
        buildFeedPermissions(
          'user123',
          // @ts-expect-error Simulating invalid input
          { did: 'feed123', uri: 'at://feed/123' },
          []
        )
      ).toThrow(
        'Invalid input data: createdFeeds and existingPermissions must be arrays.'
      );
    });

    it('throws an error for malformed feed data in createdFeeds', () => {
      expect(() =>
        buildFeedPermissions('user123', [{ did: '', uri: '' }], [])
      ).toThrow(
        'Invalid feed data: Each feed must have a valid "did" and "uri".'
      );
    });

    it('throws an error for malformed permission data in existingPermissions', () => {
      expect(() =>
        buildFeedPermissions(
          'user123',
          [],
          [{ role: 'user', feed_did: '', feed_name: '' }]
        )
      ).toThrow(
        'Invalid permission data: Each permission must have a valid feed_did, feed_name, and role.'
      );
    });

    it('throws an error for invalid role values in existingPermissions', () => {
      const userDid = 'user123';
      const createdFeeds: { did: string; uri: string }[] = [];
      const existingPermissions: {
        role: UserRole;
        feed_did: string;
        feed_name: string;
      }[] = [
        { role: 'invalid' as UserRole, feed_did: 'feed123', feed_name: '123' },
      ];

      expect(() =>
        buildFeedPermissions(userDid, createdFeeds, existingPermissions)
      ).toThrow('Invalid role value: invalid');
    });
  });

  describe('Sorting and Duplicates', () => {
    it('returns sorted permissions based on feed_did', () => {
      const userDid = 'user123';
      const createdFeeds: { did: string; uri: string }[] = [
        { did: 'feed789', uri: 'at://feed/789' },
        { did: 'feed123', uri: 'at://feed/123' },
      ];
      const existingPermissions: {
        role: UserRole;
        feed_did: string;
        feed_name: string;
      }[] = [{ role: 'mod', feed_did: 'feed456', feed_name: '456' }];

      const permissions = buildFeedPermissions(
        userDid,
        createdFeeds,
        existingPermissions
      );

      expect(permissions).toEqual([
        {
          user_did: 'user123',
          feed_did: 'feed123',
          feed_name: '123',
          role: 'admin',
          created_by: 'user123',
          created_at: expect.any(String),
        },
        {
          role: 'mod',
          feed_did: 'feed456',
          feed_name: '456',
        },
        {
          user_did: 'user123',
          feed_did: 'feed789',
          feed_name: '789',
          role: 'admin',
          created_by: 'user123',
          created_at: expect.any(String),
        },
      ]);
    });

    it('retains only the highest-priority role when duplicate roles exist for the same feed', () => {
      const userDid = 'user123';
      const createdFeeds: { did: string; uri: string }[] = [];
      const existingPermissions: {
        role: UserRole;
        feed_did: string;
        feed_name: string;
      }[] = [
        { role: 'user', feed_did: 'feed456', feed_name: '456' },
        { role: 'mod', feed_did: 'feed456', feed_name: '456' },
      ];

      const permissions = buildFeedPermissions(
        userDid,
        createdFeeds,
        existingPermissions
      );

      expect(permissions).toEqual([
        {
          role: 'mod',
          feed_did: 'feed456',
          feed_name: '456',
        },
      ]);
    });
  });
});

describe('Role Prioritization', () => {
  it('assigns admin roles for multiple created feeds and retains mod roles for others', () => {
    const userDid = 'user123';
    const createdFeeds: { did: string; uri: string }[] = [
      { did: 'feed123', uri: 'at://feed/123' },
      { did: 'feed789', uri: 'at://feed/789' },
    ];
    const existingPermissions: {
      role: UserRole;
      feed_did: string;
      feed_name: string;
    }[] = [
      { role: 'mod', feed_did: 'feed456', feed_name: '456' },
      { role: 'user', feed_did: 'feed789', feed_name: '789' }, // Same feed as created
    ];

    const permissions = buildFeedPermissions(
      userDid,
      createdFeeds,
      existingPermissions
    );

    expect(permissions).toEqual([
      {
        user_did: 'user123',
        feed_did: 'feed123',
        feed_name: '123',
        role: 'admin',
        created_by: 'user123',
        created_at: expect.any(String),
      },
      {
        role: 'mod',
        feed_did: 'feed456',
        feed_name: '456',
      },
      {
        user_did: 'user123',
        feed_did: 'feed789',
        feed_name: '789',
        role: 'admin',
        created_by: 'user123',
        created_at: expect.any(String),
      },
    ]);
  });

  it('retains mod roles for feeds not created by the user and prioritizes admin for created feeds', () => {
    const userDid = 'user123';
    const createdFeeds: { did: string; uri: string }[] = [
      { did: 'feed123', uri: 'at://feed/123' },
    ];
    const existingPermissions: {
      role: UserRole;
      feed_did: string;
      feed_name: string;
    }[] = [
      { role: 'mod', feed_did: 'feed123', feed_name: '123' }, // Same feed as created
      { role: 'mod', feed_did: 'feed456', feed_name: '456' },
      { role: 'user', feed_did: 'feed789', feed_name: '789' },
    ];

    const permissions = buildFeedPermissions(
      userDid,
      createdFeeds,
      existingPermissions
    );

    expect(permissions).toEqual([
      {
        user_did: 'user123',
        feed_did: 'feed123',
        feed_name: '123',
        role: 'admin', // Admin takes priority over mod
        created_by: 'user123',
        created_at: expect.any(String),
      },
      {
        role: 'mod',
        feed_did: 'feed456',
        feed_name: '456',
      },
      {
        role: 'user',
        feed_did: 'feed789',
        feed_name: '789',
      },
    ]);
  });

  it('retains only the highest-priority role for overlapping permissions across multiple feeds', () => {
    const userDid = 'user123';
    const createdFeeds: { did: string; uri: string }[] = [
      { did: 'feed123', uri: 'at://feed/123' },
      { did: 'feed456', uri: 'at://feed/456' },
    ];
    const existingPermissions: {
      role: UserRole;
      feed_did: string;
      feed_name: string;
    }[] = [
      { role: 'mod', feed_did: 'feed123', feed_name: '123' },
      { role: 'user', feed_did: 'feed456', feed_name: '456' }, // Lower priority than created feed
      { role: 'mod', feed_did: 'feed789', feed_name: '789' },
    ];

    const permissions = buildFeedPermissions(
      userDid,
      createdFeeds,
      existingPermissions
    );

    expect(permissions).toEqual([
      {
        user_did: 'user123',
        feed_did: 'feed123',
        feed_name: '123',
        role: 'admin', // Admin takes priority over mod
        created_by: 'user123',
        created_at: expect.any(String),
      },
      {
        user_did: 'user123',
        feed_did: 'feed456',
        feed_name: '456',
        role: 'admin', // Admin takes priority over user
        created_by: 'user123',
        created_at: expect.any(String),
      },
      {
        role: 'mod',
        feed_did: 'feed789',
        feed_name: '789',
      },
    ]);
  });
});
