import { AppBskyEmbedVideo } from '@atproto/api';

export const EmbedVideoView = ({
  embed,
}: {
  embed: AppBskyEmbedVideo.View;
}) => {
  return (
    <div className='relative mt-4 mx-auto'>
      <video
        controls
        playsInline
        poster={embed.thumbnail}
        className='object-cover w-full rounded-md'
      >
        <source src={embed.playlist || ''} type='application/x-mpegURL' />
      </video>
    </div>
  );
};
