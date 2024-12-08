import LoginButton from '@/components/button/login-button';
import LogoutButton from '@/components/button/logout-button';
import getSession from '@/repos/iron';

export default async function Page() {
  const session = await getSession();
  console.log({ session });

  if (!session.user) {
    return (
      <main className='flex flex-col gap-8 row-start-2 items-center sm:items-start'>
        <span>
          You need to be logged in to view this page. <LoginButton />
        </span>
      </main>
    );
  }

  return (
    <main className='flex flex-col gap-8 row-start-2 items-center sm:items-start'>
      <span>
        Private page, welcome {session.user.name}! <LogoutButton />
      </span>
    </main>
  );
}
