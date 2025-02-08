import React from 'react';
import { AppBskyEmbedImages } from '@atproto/api';

import { OptimizedImage } from '@/components/optimized-image';
import cc from 'classcat';

export const PostImages = ({
  content,
}: {
  content: AppBskyEmbedImages.View;
}) => {
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
              'h-app-post-image-multi-small w-app-post-image-multi-small':
                imageCount >= 3,
            },
          ])}
        />
      ))}
    </div>
  );
};
