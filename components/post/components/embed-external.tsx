import { OptimizedImage } from '@/components/optimized-image';
import { AppBskyEmbedExternal } from '@atproto/api';
import Link from 'next/link';
import { toNiceDomain } from '../utils';

export const EmbedExternal = ({
  content,
}: {
  content: AppBskyEmbedExternal.View;
}) => {
  const isGif = content.external.uri && content.external.uri.includes('.gif');
  if (isGif) {
    return (
      <OptimizedImage
        src={content.external.uri ?? content.external.thumb}
        alt={content.external.title}
        className='aspect-[1.91/1] object-cover mx-auto rounded-lg'
      />
    );
  }
  // generally social cards
  return (
    <Link
      href={content.external.uri}
      className='w-full rounded-lg overflow-hidden border border-gray-800 flex flex-col items-stretch'
      aria-labelledby={`card-title-${content.external.id} card-description-${content.external.id}`}
    >
      {content.external.thumb && (
        <OptimizedImage
          src={content.external.thumb}
          className='aspect-[1.91/1] object-cover'
          alt=''
          aria-hidden={true}
        />
      )}
      <div className='py-3 px-4'>
        <p
          id={`card-domain-${content.external.id}`}
          className='text-sm text-textLight line-clamp-1'
        >
          {toNiceDomain(content.external.uri)}
        </p>
        <p
          id={`card-title-${content.external.id}`}
          className='font-semibold line-clamp-3'
        >
          {content.external.title}
        </p>
        {content.external.description && (
          <p
            id={`card-description-${content.external.id}`}
            className='text-sm text-textLight mt-1 line-clamp-2'
          >
            {content.external.description}
          </p>
        )}
      </div>
    </Link>
  );
};
