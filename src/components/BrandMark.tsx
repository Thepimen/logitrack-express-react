import React from 'react';

export interface BrandMarkProps {
  readonly size?: number;
  readonly className?: string;
}

/**
 * Emblema minimalista de LogiTrack Express:
 * Monograma geométrico L + bloque de carga sobre azul cobalto.
 * Coincide exactamente con `public/favicon.svg`.
 */
export const BrandMark: React.FC<BrandMarkProps> = ({ size = 32, className = '' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      className={className}
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="ltBrandMinBg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#2563EB" />
          <stop offset="100%" stop-color="#1D4ED8" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#ltBrandMinBg)" />
      <path
        d="M19 16C19 14.8954 19.8954 14 21 14H26C27.1046 14 28 14.8954 28 16V39H46C47.1046 39 48 39.8954 48 41V46C48 47.1046 47.1046 48 46 48H21C19.8954 48 19 47.1046 19 46V16Z"
        fill="#FFFFFF"
      />
      <rect x="34" y="16" width="14" height="14" rx="3.5" fill="#93C5FD" />
    </svg>
  );
};
