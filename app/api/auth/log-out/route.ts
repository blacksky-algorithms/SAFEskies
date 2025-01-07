import { NextResponse } from 'next/server';
import { getSession } from '@/repos/iron';

export async function POST() {
  try {
    const session = await getSession();
    await session.destroy();
    await session.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
}
