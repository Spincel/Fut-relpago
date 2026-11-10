import React from 'react';
import { TeamBadgeConfig } from '../types/tournament';

interface TeamBadgeProps {
  badge?: TeamBadgeConfig;
  teamName?: string;
  size?: number | 'sm' | 'md' | 'lg';
  className?: string;
  fallbackColor?: string;
}

export const DEFAULT_BADGE: TeamBadgeConfig = {
  shape: 'shield',
  pattern: 'solid',
  primaryColor: '#ef4444',
  secondaryColor: '#ffffff',
  accentColor: '#000000',
};

export const TeamBadge: React.FC<TeamBadgeProps> = ({
  badge = DEFAULT_BADGE,
  teamName = 'Equipo',
  size = 48,
  className = '',
  fallbackColor,
}) => {
  const numericSize =
    typeof size === 'number'
      ? size
      : size === 'sm'
      ? 28
      : size === 'lg'
      ? 64
      : 40;

  const effectiveBadge = badge || DEFAULT_BADGE;
  const {
    shape = 'shield',
    pattern = 'solid',
    primaryColor = '#ef4444',
    secondaryColor = '#ffffff',
    accentColor = '#000000',
  } = effectiveBadge;

  const clipId = React.useId();
  const initial = (teamName.trim().charAt(0) || 'E').toUpperCase();

  // Path definition depending on shape (100x100 coordinate box)
  let shapePath = 'M 10 10 L 90 10 L 90 55 C 90 85 50 98 50 98 C 50 98 10 85 10 55 Z'; // shield default
  if (shape === 'circle') {
    shapePath = 'M 50 6 A 44 44 0 1 1 49.9 6 Z';
  } else if (shape === 'oval') {
    shapePath = 'M 50 4 C 75 4 88 25 88 50 C 88 75 75 96 50 96 C 25 96 12 75 12 50 C 12 25 25 4 50 4 Z';
  } else if (shape === 'square') {
    shapePath = 'M 50 6 L 94 50 L 50 94 L 6 50 Z'; // Diamond crest
  }

  return (
    <div
      className={`relative shrink-0 flex items-center justify-center select-none ${className}`}
      style={{ width: numericSize, height: numericSize }}
      title={`Escudo de ${teamName}`}
    >
      <svg
        viewBox="0 0 100 100"
        width={numericSize}
        height={numericSize}
        className="overflow-visible filter drop-shadow-md"
      >
        <defs>
          {/* Clip path defining the outer badge silhouette */}
          <clipPath id={`badge-clip-${clipId}`}>
            <path d={shapePath} />
          </clipPath>

          {/* Glossy top overlay */}
          <linearGradient id={`gloss-${clipId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
          </linearGradient>

          {/* Golden border gradient */}
          <linearGradient id={`gold-border-${clipId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="45%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#fde047" />
          </linearGradient>
        </defs>

        {/* Outer glow / shadow base */}
        <path d={shapePath} fill="#020617" />

        {/* Pattern inside badge */}
        <g clipPath={`url(#badge-clip-${clipId})`}>
          {/* Base primary color */}
          <rect x="0" y="0" width="100" height="100" fill={primaryColor} />

          {/* Bicolor: half & half */}
          {pattern === 'bicolor' && (
            <rect x="50" y="0" width="50" height="100" fill={secondaryColor || '#ffffff'} />
          )}

          {/* Striped / Franja diagonal */}
          {pattern === 'striped' && (
            <polygon
              points="0,35 65,100 100,100 100,65 35,0 0,0"
              fill={secondaryColor || '#ffffff'}
            />
          )}

          {/* Tricolor: 3 vertical stripes */}
          {pattern === 'tricolor' && (
            <>
              <rect x="0" y="0" width="33.3" height="100" fill={primaryColor} />
              <rect x="33.3" y="0" width="33.4" height="100" fill={secondaryColor || '#ffffff'} />
              <rect x="66.7" y="0" width="33.3" height="100" fill={accentColor || '#000000'} />
            </>
          )}

          {/* Glossy lighting overlay */}
          <rect x="0" y="0" width="100" height="100" fill={`url(#gloss-${clipId})`} />

          {/* Central Emblem Badge (Small circle with initial or ball) */}
          <circle
            cx="50"
            cy="50"
            r="20"
            fill="rgba(15, 23, 42, 0.75)"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="1.5"
          />

          {/* Team Initial letter */}
          <text
            x="50"
            y="57"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="18"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
          >
            {initial}
          </text>
        </g>

        {/* Outer Golden Metallic Rim */}
        <path
          d={shapePath}
          fill="none"
          stroke={`url(#gold-border-${clipId})`}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Subtle inner border */}
        <path
          d={shapePath}
          fill="none"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="1.2"
          transform="scale(0.92) translate(4, 4)"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
