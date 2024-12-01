import React from 'react';

import { OptimizedImage } from '@/components/optimized-image';
import cc from 'classcat';
import { ViewImage } from '@atproto/api/dist/client/types/app/bsky/embed/images';

export const PostImages = ({ images }: { images: ViewImage[] }) => {
  const imageCount = images.length;

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
      {images.map((image, index) => (
        <OptimizedImage
          lazy
          key={index}
          src={image.fullsize || image.thumb}
          alt={image.alt || 'Image'}
          className={cc([
            'rounded-md object-contain',
            {
              'h-auto w-full': images.length <= 2,
              'h-theme-post-image-multi w-theme-post-image-multi':
                images.length >= 3,
            },
          ])}
        />
      ))}
    </div>
  );
};
