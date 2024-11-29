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
  mimeType?: string; // Optional MIME type for better detection
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  sizes,
  srcSet,
  lazy = true,
  mimeType,
}) => {
  const [fallback, setFallback] = useState(false);

  // Determine if the file is a GIF based on MIME type or file extension
  const isGif = mimeType === 'image/gif' || src.toLowerCase().endsWith('.gif');

  if (fallback || !isGif) {
    // Fallback to <img> or render <img> for non-GIF files
    return (
      <img
        src={src}
        alt={alt}
        sizes={sizes}
        srcSet={srcSet}
        loading={lazy ? 'lazy' : 'eager'}
        className={`object-cover ${className}`}
        onError={() => setFallback(true)}
      />
    );
  }

  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      className={`object-cover ${className}`}
      onError={() => setFallback(true)}
    >
      <source src={src} type='image/gif' />
      Your browser does not support the video tag.
    </video>
  );
};
