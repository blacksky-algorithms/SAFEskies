import React, { useState } from 'react';
import cc from 'classcat';

interface OptimizedImageProps {
  src?: string; // Make src optional
  alt: string;
  className?: string;
  lazy?: boolean;
  mimeType?: string;
  thumbnail?: string; // Fallback thumbnail or poster
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  lazy = true,
  mimeType,
  thumbnail,
}) => {
  const [fallback, setFallback] = useState(false);

  // Safeguard: Ensure src is null if it's not a valid string
  const isValidSrc = typeof src === 'string' && src.trim() !== '';
  const safeSrc = isValidSrc ? src : null;

  const isGif =
    mimeType === 'image/gif' || (safeSrc && safeSrc.endsWith('.gif'));
  const isVideo =
    mimeType?.startsWith('video/') ||
    (safeSrc && (safeSrc.endsWith('.mp4') || safeSrc.endsWith('.webm')));

  if (fallback || !safeSrc) {
    return (
      <img
        src={thumbnail || undefined} // Pass `undefined` if thumbnail is not available
        alt={alt}
        className={cc([className, 'object-cover'])}
        loading={lazy ? 'lazy' : 'eager'}
      />
    );
  }

  if (isGif) {
    return (
      <video
        autoPlay
        loop
        muted
        playsInline
        className={cc([className, 'object-cover'])}
        onError={() => setFallback(true)}
        src={safeSrc} // Use validated safeSrc
      >
        <source src={safeSrc} type='image/gif' />
        {/* Fallback */}
        <img
          src={thumbnail || undefined}
          alt={alt}
          className={cc([className, 'object-cover'])}
          onError={() => setFallback(true)}
        />
      </video>
    );
  }

  if (isVideo) {
    return (
      <video
        controls
        playsInline
        poster={thumbnail || undefined}
        className={cc([className, 'object-cover'])}
        onError={() => setFallback(true)}
      >
        <source src={safeSrc} type={mimeType || 'video/mp4'} />
        <img
          src={thumbnail || undefined}
          alt={alt}
          className={cc([className, 'object-cover'])}
          onError={() => setFallback(true)}
        />
      </video>
    );
  }

  return (
    <img
      src={safeSrc}
      alt={alt}
      className={cc([className, 'object-cover'])}
      loading={lazy ? 'lazy' : 'eager'}
      onError={() => setFallback(true)}
    />
  );
};
