import React from 'react';
import { cn } from '../../lib/utils';

interface VerifiedBadgeProps {
  isGolden?: boolean;
  className?: string;
  size?: number;
}

export function VerifiedBadge({ isGolden, className, size = 14 }: VerifiedBadgeProps) {
  // SVG path matching the exact Instagram verified badge shape
  return (
    <svg 
      aria-label="Verified" 
      className={cn("inline-flex ml-1 flex-shrink-0 align-middle drop-shadow-sm", className)} 
      fill={isGolden ? "url(#gold-gradient)" : "rgb(0, 149, 246)"} 
      height={size} 
      role="img" 
      viewBox="0 0 40 40" 
      width={size}
    >
      <title>Verified</title>
      <defs>
        <linearGradient id="gold-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F9A826" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FFF878" />
        </linearGradient>
      </defs>
      <path d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z" fillRule="evenodd"></path>
    </svg>
  );
}
