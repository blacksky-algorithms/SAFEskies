/* eslint-disable @next/next/no-img-element */
import React from 'react';
import cc from 'classcat';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  lazy?: boolean;
  thumbnail?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  lazy = true,
  thumbnail,
}) => {
  return (
    <img
      src={src || thumbnail}
      alt={alt}
      className={cc([className, 'object-cover'])}
      loading={lazy ? 'lazy' : 'eager'}
    />
  );
};
