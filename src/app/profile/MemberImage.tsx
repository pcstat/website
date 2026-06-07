'use client';

import React from 'react';
import Image from 'next/image';

export const MemberImage = ({ src, alt, fallback, className }: { src?: string; alt: string; fallback: string; className?: string }) => {
  const [imageError, setImageError] = React.useState(false);

  if (!src || imageError) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {fallback}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={120}
      height={120}
      className={className}
      priority
      onError={() => setImageError(true)}
      unoptimized
    />
  );
};
