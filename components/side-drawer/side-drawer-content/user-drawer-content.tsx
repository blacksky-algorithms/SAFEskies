'use client';

import React from 'react';
import { User } from '@/lib/types/user';

interface Props {
  user: User;
}

export const UserDrawerContent = ({ user }: Props) => {
  return (
    <p>Hey {(user.display_name as string) || `@${user.handle}` || 'you'}</p>
  );
};
