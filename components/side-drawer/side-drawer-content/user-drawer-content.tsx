'use client';

import React from 'react';
import { User } from '@/types/user';

interface Props {
  user: User;
}

export const UserDrawerContent = ({ user }: Props) => {
  return <p>Hey {user.name || user.handle || 'you'}</p>;
};
