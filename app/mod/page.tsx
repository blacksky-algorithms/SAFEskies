import { LoginButton } from '@/components/button/login-button';
import { getSession } from '@/repos/iron';

export default async function Page() {
  const { user } = await getSession();

  if (!user) {
    return (
      <section className='flex flex-col gap-8 row-start-2 items-center sm:items-start'>
        <span>
          You need to be logged in to view this page. <LoginButton />
        </span>
      </section>
    );
  }
  console.log({ user });
  return (
    <section className='flex flex-col items-center justify-center'>
      <span>Private page, welcome {user.name}! </span>
    </section>
  );
}
