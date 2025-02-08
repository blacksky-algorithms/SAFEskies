import { OptimizedImage } from '@/components/optimized-image';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import cc from 'classcat';

export const PostHeader = ({
  author,
  isAuthorLabeled,
  postIndexedAt,
  id,
}: {
  author: ProfileViewBasic;
  isAuthorLabeled?: boolean;
  postIndexedAt?: string;
  id?: string;
}) => {
  if (!author) return null;
  const formatPostedOn = () => {
    if (!postIndexedAt) return null;
    const postedOn = new Date(postIndexedAt);
    const now = new Date();
    const diff = now.getTime() - postedOn.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) {
      return `${minutes}m`;
    }
    if (hours < 24) {
      return `${hours}h`;
    }
    return `${days}d`;
  };

  return (
    <div id={id} className='flex items-center justify-between '>
      <div className='mb-2 flex items-center'>
        {author.avatar && (
          <OptimizedImage
            src={author.avatar}
            alt={`Avatar of ${author?.displayName || author.handle}`}
            className={cc([
              'w-8 h-8 rounded-full mr-2',
              { 'blur-[1.5px]': isAuthorLabeled },
            ])}
          />
        )}
        <div>
          <p className='font-semibold'>
            {author?.displayName || author.handle}
          </p>
          <p className='text-sm text-app-secondary'>@{author.handle}</p>
        </div>
      </div>
      <span className='text-sm text-app-secondary p-4'>{formatPostedOn()}</span>
    </div>
  );
};
