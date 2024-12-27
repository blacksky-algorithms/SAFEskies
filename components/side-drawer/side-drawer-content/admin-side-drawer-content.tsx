import React from 'react';
import { FeedRoleInfo, User } from '@/types/user';
import { SideDrawerLink } from '../components/side-drawer-link';

interface AdminSideDrawerContentProps {
  user: User | null;
  handleLinkClick: (path: string) => void;
}

export const AdminFeeds = ({ user }: { user: User }) => {
  const adminFeeds = Object.entries(user.rolesByFeed || {})
    .filter(([, roleInfo]) => (roleInfo as FeedRoleInfo).role === 'admin')
    .map(([uri, roleInfo]) => ({
      uri,
      displayName: (roleInfo as FeedRoleInfo).displayName,
    }));

  return (
    <div className='space-y-4'>
      {adminFeeds.map((feed) => (
        <div key={feed.uri}>
          <h3 className='text-lg font-bold'>{feed.displayName}</h3>
          <p>{feed.uri}</p>
        </div>
      ))}
    </div>
  );
};

export const ModFeedLinks = ({ user }: { user: User }) => {
  const modFeeds = Object.entries(user.rolesByFeed || {})
    .filter(([, roleInfo]) => (roleInfo as FeedRoleInfo).role === 'mod')
    .map(([uri, roleInfo]) => ({
      uri,
      displayName: (roleInfo as FeedRoleInfo).displayName,
    }));

  return (
    <div className='space-y-4'>
      {modFeeds.map((feed) => (
        <SideDrawerLink
          key={feed.uri}
          label={feed.displayName}
          href={`/feed/${feed.uri}`}
        />
      ))}
    </div>
  );
};

export const AdminSideDrawerContent = ({
  user,
  handleLinkClick,
}: AdminSideDrawerContentProps) => {
  if (!user) return null;
  const adminFeeds = Object.entries(user.rolesByFeed || {})
    .filter(([, roleInfo]) => (roleInfo as FeedRoleInfo).role === 'admin')
    .map(([uri, roleInfo]) => ({
      uri,
      displayName: (roleInfo as FeedRoleInfo).displayName,
    }));
  return (
    <nav className='p-4 space-y-4'>
      <ul className='space-y-2'>
        <SideDrawerLink
          label='Moderators'
          nestedLinks={[
            { label: 'Promote User', href: '/admin/mods/promote' },
            { label: 'Manage Moderators', href: '/admin/mods/manage' },
          ]}
          onClick={handleLinkClick}
        />
      </ul>
      <ul className='space-y-2'>
        <SideDrawerLink
          label='Admin Feeds'
          nestedLinks={adminFeeds.map((feed) => ({
            label: feed.displayName,
            href: `/feed/${feed.uri}`,
          }))}
        />
      </ul>
    </nav>
  );
};
