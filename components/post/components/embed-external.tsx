import { OptimizedImage } from '@/components/optimized-image';
import { AppBskyEmbedExternal } from '@atproto/api';

export const EmbedExternal = ({
  embed,
}: {
  embed: AppBskyEmbedExternal.View;
}) => {
  const { uri, title, description, thumb } = embed.external;

  const isGif = uri.includes('.gif') || thumb?.endsWith('.gif');

  return (
    <div className='mt-4 border border-gray-800 rounded-md p-2'>
      {isGif ? (
        <OptimizedImage
          lazy
          src={uri}
          alt={description ?? title}
          className='rounded-md mx-auto'
        />
      ) : (
        <a href={uri} target='_blank' rel='noopener noreferrer'>
          <div className='flex flex-col'>
            <OptimizedImage
              lazy
              src={thumb}
              alt={title}
              className='rounded-md'
            />
            <div className='mt-2'>
              <h4 className='text-sm font-bold'>{title}</h4>
              <p className='text-xs text-gray-500'>{description}</p>
            </div>
          </div>
        </a>
      )}
    </div>
  );
};
