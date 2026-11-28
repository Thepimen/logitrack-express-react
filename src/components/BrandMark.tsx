import React from 'react';

export interface BrandMarkProps {
  readonly size?: number;
  readonly className?: string;
}

/**
 * Emblema geométrico personalizado de LogiTrack Express
 * Representa un bulto isométrico sobre cinta transportadora en azul cobalto.
 */
export const BrandMark: React.FC<BrandMarkProps> = ({ size = 34, className = '' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect x="2" y="2" width="60" height="60" rx="12" fill="#1D4ED8" />
      <polygon points="32,12 50,21.5 32,31 14,21.5" fill="#FFFFFF" />
      <polygon points="14,23.5 30.8,32.4 30.8,47.5 14,38.6" fill="#93C5FD" />
      <polygon points="50,23.5 33.2,32.4 33.2,47.5 50,38.6" fill="#EFF6FF" />
      <rect x="12" y="50" width="40" height="4.5" rx="2.25" fill="#7DD3FC" />
      <rect x="18" y="51.25" width="7" height="2" rx="1" fill="#1E3A8A" />
      <rect x="28.5" y="51.25" width="7" height="2" rx="1" fill="#1E3A8A" />
      <rect x="39" y="51.25" width="7" height="2" rx="1" fill="#1E3A8A" />
    </svg>
  );
};
