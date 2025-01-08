'use client';

import React from 'react';
import { User } from '@/lib/types/user';

interface Props {
  user: User;
}

export const UserDrawerContent = ({ user }: Props) => {
  return <p>Hey {`@${user.handle}` || user.displayName || 'you'}</p>;
};
