import { OptimizedImage } from '@/components/optimized-image';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import cc from 'classcat';

export const PostHeader = ({
  author,
  isAuthorLabeled,
}: {
  author: ProfileViewBasic;
  isAuthorLabeled?: boolean;
}) => {
  if (!author) return null;
  // TODO: Add labels to post header? Need to understand what labels are and where they come from
  return (
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
        <p className='font-semibold'>{author?.displayName || author.handle}</p>
        <p className='text-sm'>@{author.handle}</p>
      </div>
      <div className='flex items-center space-x-2'></div>
    </div>
  );
};
