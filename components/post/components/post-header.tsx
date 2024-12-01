import { OptimizedImage } from '@/components/optimized-image';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';

export const PostHeader = ({
  author,
}: // labels,
{
  author: ProfileViewBasic;
  // labels: Labels[];
}) => {
  if (!author) return null;
  // TODO: Add labels to post header
  return (
    <div className='mb-2 flex items-center'>
      <OptimizedImage
        src={author?.avatar ?? undefined}
        alt={`Avatar of ${author.displayName || author.handle}`}
        className='w-8 h-8 rounded-full mr-2'
      />
      <div>
        <p className='font-semibold'>{author.displayName || author.handle}</p>
        <p className='text-sm'>@{author.handle}</p>
      </div>
      <div className='flex items-center space-x-2'></div>
    </div>
  );
};
