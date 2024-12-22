# Role Management Documentation

## Overview

This document provides a comprehensive overview of the role management system implemented in the application. It outlines the purpose, behavior, implementation details, test coverage, and potential future improvements for managing roles within feeds. The system uses a feed-centric permission model to determine and manage user roles such as `admin`, `mod`, and `user` at a granular level.

---

## High-Level Behavior

### Role Management Goals

1. **Feed-Centric Permissions**: Each user’s role is defined per feed.
2. **Prioritized Roles**: Role hierarchy ensures `admin > mod > user`.
3. **Input Validation**: Guards ensure data integrity for roles and permissions.
4. **Consistency**: Duplicate roles are resolved by retaining the highest-priority role.
5. **Sorting**: Permissions are consistently sorted by `feed_did`.

### Key Components

1. **Role Determination**:

   - **`determineUserRole`**: Determines the user’s overall role based on created feeds and existing permissions.

2. **Permission Building**:

   - **`buildFeedPermissions`**: Combines created feed permissions with existing permissions while prioritizing roles and handling duplicates.

3. **Validation Guards**:
   - Ensure input data validity and prevent invalid or duplicate permissions.

---

## Implementation Details

### Role Priority System

Role prioritization is managed centrally using the `ROLE_PRIORITY` object:

```typescript
const ROLE_PRIORITY: Record<UserRole, number> = {
  admin: 3,
  mod: 2,
  user: 1,
};
```

### Key Functions

#### 1. `determineUserRole`

- Determines the user’s overall role based on:
  - Created feeds (‘admin’ takes precedence).
  - Existing permissions (‘mod’ takes precedence over ‘user’).

#### 2. `buildFeedPermissions`

- Combines and prioritizes permissions for created feeds and existing permissions.
- Key operations:
  - **Validation Guards**: Checks for valid input data.
  - **Admin Permissions**: Grants `admin` role for created feeds.
  - **Permissions Map**: Resolves duplicate roles by retaining the highest-priority role.
  - **Sorting**: Ensures consistent output order by `feed_did`.

---

## Test Coverage

### Test Suites

#### 1. `determineUserRole`

- **Purpose**: Verifies role determination logic.
- **Test Cases**:
  - Returns `admin` if the user has created feeds.
  - Returns `mod` if the user has no created feeds but has `mod` permissions.
  - Returns `user` if the user has no created feeds or `mod` permissions.

#### 2. `buildFeedPermissions`

##### Basic Functionality

- Combines created feed permissions with existing permissions.
- Returns an empty array when there are no inputs.

##### Role Prioritization

- Assigns `admin` for created feeds.
- Ensures `mod` and `user` roles do not override `admin`.
- Resolves duplicates by retaining the highest-priority role.

##### Error Handling

- Throws errors for:
  - Invalid user ID.
  - Malformed feed data in created feeds.
  - Malformed permission data in existing permissions.
  - Invalid role values in existing permissions.

##### Complex Role Combinations

- Handles scenarios with overlapping permissions and multiple created feeds.
- Ensures consistent role prioritization and sorting.

---

## Example Scenarios

### Input Validation

```typescript
// Invalid user ID
expect(() => buildFeedPermissions('', [], [])).toThrow(
  'Invalid user ID provided.'
);

// Malformed created feed data
expect(() =>
  buildFeedPermissions('user123', [{ did: '', uri: '' }], [])
).toThrow('Invalid feed data: Each feed must have a valid "did" and "uri".');
```

### Role Prioritization

```typescript
// Admin overrides mod
const createdFeeds = [{ did: 'feed123', uri: 'at://feed/123' }];
const existingPermissions = [
  { role: 'mod', feed_did: 'feed123', feed_name: '123' },
];

const permissions = buildFeedPermissions(
  'user123',
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
```

### Sorting and Duplicates

```typescript
// Sorted output
const createdFeeds = [
  { did: 'feed789', uri: 'at://feed/789' },
  { did: 'feed123', uri: 'at://feed/123' },
];
const existingPermissions = [
  { role: 'mod', feed_did: 'feed456', feed_name: '456' },
];

const permissions = buildFeedPermissions(
  'user123',
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
```

---

## Future Considerations

1. **Audit Logging**:

   - Track changes to permissions for debugging and accountability.

2. **Extended Role Types**:

   - Support for additional roles (e.g., `viewer`, `contributor`).
   - Update `ROLE_PRIORITY` and related logic.

3. **Synchronization**:

   - Regularly audit and synchronize feed permissions with the database state to prevent drift.

4. **Performance Optimization**:

   - Optimize the sorting and duplicate resolution logic for large datasets.

5. **Error Handling**:
   - Improve error messages for better developer and user clarity.

---

## Summary

This role management system provides a robust foundation for feed-centric permission handling. By combining role prioritization, validation, and test coverage, it ensures reliability and consistency while offering scalability for future enhancements.
