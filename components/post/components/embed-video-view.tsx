import React, { useEffect, useRef } from 'react';
import { AppBskyEmbedVideo } from '@atproto/api';
import Hls from 'hls.js';
import { Info } from './embed-info';

const clamp = (num: number, min: number, max: number) =>
  Math.max(min, Math.min(num, max));

export const EmbedVideoView = ({
  embed,
  labelInfo,
}: {
  embed: AppBskyEmbedVideo.View;
  labelInfo?: string;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(embed.playlist);
      hls.attachMedia(videoRef.current!);
    } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari supports HLS natively
      videoRef.current.src = embed.playlist;
    }
  }, [embed.playlist]);

  let aspectRatio = 1;
  if (embed.aspectRatio) {
    const { width, height } = embed.aspectRatio;
    aspectRatio = clamp(width / height, 1 / 1, 3 / 1);
  }
  if (labelInfo) {
    return <Info>{labelInfo}</Info>;
  }
  return (
    <div
      className='relative mt-4 mx-auto'
      style={{
        aspectRatio: `${aspectRatio} / 1`,
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        controls
        playsInline
        poster={embed.thumbnail}
        className='object-cover w-full rounded-lg h-full'
        muted
        loop
        src={embed.playlist}
      />
    </div>
  );
};
