import React, { useMemo, useState } from 'react';
import { getImageUrl } from '../utils/imageHelper';

type ImageSize = 'square_hd' | 'square' | 'portrait_4_3' | 'portrait_16_9' | 'landscape_4_3' | 'landscape_16_9';

export const GeneratedImage = ({
  prompts,
  size,
  alt,
  className,
  style,
  loading = 'lazy',
}: {
  prompts: string[];
  size: ImageSize;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: 'eager' | 'lazy';
}) => {
  const [idx, setIdx] = useState(0);

  const src = useMemo(() => {
    const safePrompt = prompts[Math.min(idx, Math.max(0, prompts.length - 1))] ?? '';
    return getImageUrl(safePrompt, size);
  }, [idx, prompts, size]);

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      className={className}
      style={style}
      onError={() => {
        setIdx((v) => (v < prompts.length - 1 ? v + 1 : v));
      }}
    />
  );
};

