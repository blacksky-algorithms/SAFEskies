/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  sizes?: string;
  srcSet?: string;
  lazy?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  sizes,
  srcSet,
  lazy = true,
}) => {
  const [hasError, setHasError] = useState(false);

  return hasError ? (
    <div className='bg-gray-300 text-center flex items-center justify-center w-full h-auto'>
      <span>Error loading image</span>
    </div>
  ) : (
    <img
      src={src}
      alt={alt}
      sizes={sizes}
      srcSet={srcSet}
      loading={lazy ? 'lazy' : 'eager'}
      className={`object-cover ${className}`}
      onError={() => setHasError(true)}
    />
  );
};
