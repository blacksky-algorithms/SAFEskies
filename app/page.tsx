import Feed from '@/pages/feed';
import { background } from '@/utils/todo';

export default async function page() {
  return (
    <div className={background}>
      <Feed />
    </div>
  );
}
