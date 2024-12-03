import { AppBskyGraphDefs, AppBskyGraphStarterpack } from '@atproto/api';
import { getRkey } from '../utils';
import { Info } from './embed-info';
import Link from 'next/link';
import { Icon } from '@/components/icon';
import { OptimizedImage } from '@/components/optimized-image';

export const StarterPackEmbed = ({
  content,
}: {
  content: AppBskyGraphDefs.StarterPackViewBasic;
}) => {
  if (!AppBskyGraphStarterpack.isRecord(content.record)) {
    return null;
  }

  const starterPackHref = getStarterPackHref(content);
  const imageUri = getStarterPackImage(content);
  function getStarterPackImage(starterPack: AppBskyGraphDefs.StarterPackView) {
    const rkey = getRkey({ uri: starterPack.uri });
    return `https://ogcard.cdn.bsky.app/start/${starterPack.creator.did}/${rkey}`;
  }

  function getStarterPackHref(
    starterPack: AppBskyGraphDefs.StarterPackViewBasic
  ) {
    const rkey = getRkey({ uri: starterPack.uri });
    const handleOrDid = starterPack.creator.handle || starterPack.creator.did;
    return `/starter-pack/${handleOrDid}/${rkey}`;
  }
  return (
    <>
      <Info>
        You will leave Only Feeds as we have not yet implemented this feature,
        this link will take you to Blue Sky
      </Info>
      <Link
        href={starterPackHref}
        className='w-full rounded-lg overflow-hidden border flex flex-col items-stretch'
      >
        <OptimizedImage
          src={imageUri}
          className={'aspect-[1.91/1] object-cover'}
          alt=''
          aria-hidden={true}
        />
        <div className='py-3 px-4'>
          <div className='flex space-x-2 items-center'>
            <Icon icon='BellIcon' className='w-10 h-10' />
            <div>
              <p className='font-semibold leading-[21px]'>
                {content.record.name}
              </p>
              <p className='text-sm text-textLight line-clamp-2 leading-[18px]'>
                Starter pack by{' '}
                {content.creator.displayName || `@${content.creator.handle}`}
              </p>
            </div>
          </div>
          {content.record.description && (
            <p className='text-sm mt-1'>{content.record.description}</p>
          )}
          {!!content.joinedAllTimeCount && content.joinedAllTimeCount > 50 && (
            <p className='text-sm font-semibold text-textLight mt-1'>
              {content.joinedAllTimeCount} users have joined!
            </p>
          )}
        </div>
      </Link>
    </>
  );
};
