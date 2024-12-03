import React from 'react';

import { OptimizedImage } from '@/components/optimized-image';
import cc from 'classcat';
import { AppBskyEmbedImages } from '@atproto/api';
import { Info } from './embed-info';

export const PostImages = ({
  content,
  labelInfo,
}: {
  content: AppBskyEmbedImages.View;
  labelInfo?: string;
}) => {
  if (labelInfo) {
    return <Info>{labelInfo}</Info>;
  }
  const imageCount = content.images.length;

  return (
    <div
      className={cc([
        'mt-4 grid gap-1 max-w-[300px] mx-auto',
        {
          'grid-cols-1': imageCount === 1,
          'grid-cols-2': imageCount === 2,
          'grid-cols-2 grid-rows-2': imageCount > 2,
        },
      ])}
    >
      {content.images.map((image, index) => (
        <OptimizedImage
          lazy
          key={index}
          src={image.fullsize || image.thumb}
          alt={image.alt || 'Image'}
          className={cc([
            'rounded-lg object-contain',
            {
              'h-auto w-full': imageCount <= 2,
              'h-theme-post-image-multi w-theme-post-image-multi':
                imageCount >= 3,
            },
          ])}
        />
      ))}
    </div>
  );
};
