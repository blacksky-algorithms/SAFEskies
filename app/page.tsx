import Feed from '@/components/feed';
import { background } from '@/utils/todo';

export default async function page() {
  return (
    <div className={background}>
      <Feed did='did:plc:qzkrgc4ahglknwb7ymee4a6w' feedName='aaafstml2groe' />
    </div>
  );
}
