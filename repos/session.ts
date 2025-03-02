import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { User } from '@/lib/types/user';

export async function getServerSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;
  if (!token) return null;
  try {
    const session = jwt.verify(token, process.env.JWT_SECRET!) as User;
    return session;
  } catch (error) {
    console.error('Server session error:', error);
    return null;
  }
}
