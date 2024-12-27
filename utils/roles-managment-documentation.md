# Role Management Documentation

## Overview

This document provides a comprehensive overview of the updated role management system implemented in the application. It explains the purpose, behavior, implementation details, and test coverage for managing roles within feeds. The system is feed-centric and assigns roles such as `admin`, `mod`, and `user` to users at a granular level, while ensuring scalability, validation, and robust error handling.

---

## High-Level Behavior

### Role Management Goals

1. **Feed-Centric Permissions**: Each user's role is scoped to a specific feed.
2. **Prioritized Roles**: Role hierarchy ensures `admin > mod > user`.
3. **Input Validation**: Guards ensure data integrity for roles and permissions.
4. **Consistency**: Conflicts are resolved by retaining the highest-priority role.
5. **Session Integration**: User roles and feed permissions are saved in the session.

### Key Components

1. **Role Determination**:

   - **`determineUserRolesByFeed`**: Determines feed-specific roles for a user based on created feeds and existing permissions.
   - **`determineUserRole`**: Determines a user’s overall role (`admin`, `mod`, or `user`).

2. **Permission Management**:

   - **`buildFeedPermissions`**: Generates feed permissions for a user by combining created feeds with existing permissions while applying role prioritization and ensuring data integrity.
   - **`PermissionsManager`**: Handles permission checks and role assignments for feeds.

3. **Validation Guards**:
   - Ensure input data validity.
   - Prevent invalid or duplicate permissions.

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

#### 1. `determineUserRolesByFeed`

- Assigns feed-specific roles for a user based on created feeds and existing permissions.
- Ensures the highest-priority role is assigned when conflicts arise.
- Uses the following logic:
  - **Created Feeds**: Assigns `admin` role to feeds created by the user.
  - **Existing Permissions**: Updates roles based on existing permissions.

#### 2. `buildFeedPermissions`

- Combines feed permissions for a user by:
  - Assigning `admin` role for created feeds.
  - Merging with existing permissions.
  - Resolving conflicts using `ROLE_PRIORITY`.

#### 3. `PermissionsManager`

- Provides utility functions to:
  - Check if a user can perform an action on a feed (e.g., `create_mod`, `remove_mod`).
  - Retrieve the user’s role for a specific feed.
  - Set or update feed roles for a user.

---

## Integration

### Authentication and Role Assignment

Role assignments are integrated into the authentication process using the following steps:

1. **Profile Retrieval**:

   - Fetches the user’s profile using `getUserProfile`.
   - Validates session data and fetches the user’s feed-specific permissions and created feeds.

2. **Role Determination**:

   - Uses `determineUserRolesByFeed` to assign roles for each feed.

3. **Permission Saving**:

   - Saves the feed permissions to the database using `SupabaseInstance`.

4. **Session Update**:
   - Stores the user’s profile and feed roles in the session using `iron-session`.

### Permissions Workflow

#### Adding a Moderator

- **Endpoint**: `/api/admin/mods` (POST)
- **Workflow**:
  1. Validate input (user DID, feed URI, etc.).
  2. Check if the current user is an `admin` for the feed.
  3. Assign the `mod` role to the target user for the specified feed.
  4. Save the updated permissions to the database.

#### Removing a Moderator

- **Endpoint**: `/api/admin/mods` (DELETE)
- **Workflow**:
  1. Validate input (user DID, feed URI, etc.).
  2. Check if the current user is an `admin` for the feed.
  3. Revoke the `mod` role from the target user for the specified feed.
  4. Log the demotion in the database.

---

## Example Scenarios

### Assigning Roles

```typescript
const rolesByFeed = determineUserRolesByFeed(existingPermissions, createdFeeds);
console.log(rolesByFeed);
/* Output:
{
  'at://feed/123': { role: 'admin', displayName: 'Feed 123', feedUri: 'at://feed/123' },
  'at://feed/456': { role: 'mod', displayName: 'Feed 456', feedUri: 'at://feed/456' }
}
*/
```

### Adding a Moderator

```typescript
await PermissionsManager.setFeedRole(
  'targetUserDid',
  'at://feed/123',
  'mod',
  'adminUserDid',
  'Feed 123'
);
```

### Removing a Moderator

```typescript
await PermissionsManager.canPerformAction(
  'adminUserDid',
  'remove_mod',
  'at://feed/123'
);
```

---

## Test Coverage

### `determineUserRolesByFeed`

- **Test Cases**:
  - Assigns `admin` for created feeds.
  - Prioritizes `mod` over `user` roles.
  - Resolves duplicate roles using `ROLE_PRIORITY`.

### `buildFeedPermissions`

- **Test Cases**:
  - Combines created and existing permissions.
  - Handles invalid input data gracefully.
  - Deduplicates roles and ensures consistent output order.

---

## Future Considerations

1. **Bulk Operations**:

   - Add support for bulk role assignment and revocation.

2. **Performance Optimization**:

   - Optimize database queries for large datasets.

3. **Error Messaging**:
   - Improve error messages for better debugging and user experience.

---

## Summary

The role management system is feed-centric, prioritizes roles, and ensures robust validation. It is designed for scalability and provides a clear foundation for managing permissions in a growing application.
