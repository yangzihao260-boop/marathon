import React from 'react';
import { RunnerInfo } from '../types';

interface RunnerSvgProps {
  runner: RunnerInfo;
  isMoving: boolean;
  stepCycle: number; // 0 to 1 loop for limb rotation
  isFinished: boolean;
  rank: number | null;
  isPlayer?: boolean;
}

export const RunnerSvg: React.FC<RunnerSvgProps> = ({
  runner,
  isMoving,
  stepCycle,
  isFinished,
  rank,
  isPlayer = false,
}) => {
  // Sine and cosine for smooth running limb movement
  const angle = isMoving ? Math.sin(stepCycle * Math.PI * 2) * 38 : 0;
  const oppositeAngle = -angle;
  const bounceY = isMoving ? Math.abs(Math.sin(stepCycle * Math.PI * 2)) * -6 : 0;
  const leanAngle = isMoving ? 12 : 2;

  const isWinner = isFinished && rank === 1;

  return (
    <div className="relative flex flex-col items-center">
      {/* Top Tag: Name & Bib */}
      <div
        className={`mb-1 px-2 py-0.5 rounded-full text-[11px] font-bold tracking-tight shadow-md flex items-center gap-1.5 whitespace-nowrap transition-transform duration-200 ${
          isPlayer
            ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300 ring-offset-1 ring-offset-slate-900 scale-105'
            : 'bg-slate-800/90 text-slate-200 border border-slate-700'
        }`}
      >
        <span
          className="w-2 h-2 rounded-full inline-block"
          style={{ backgroundColor: runner.avatarColor }}
        />
        <span>{runner.name}</span>
        <span className="bg-black/30 px-1 rounded text-[9px] font-mono">
          #{runner.bib}
        </span>
        {isWinner && <span className="text-xs">👑</span>}
      </div>

      {/* SVG Character Model */}
      <div
        className="relative w-20 h-24 select-none pointer-events-none transition-transform duration-100"
        style={{
          transform: `translateY(${bounceY}px) rotate(${isWinner ? 0 : leanAngle}deg)`,
          transformOrigin: 'bottom center',
        }}
      >
        <svg
          viewBox="0 0 100 120"
          className="w-full h-full filter drop-shadow-md overflow-visible"
        >
          <defs>
            <linearGradient id={`jersey-${runner.id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={runner.jerseyColor} />
              <stop offset="100%" stopColor={runner.accentColor} />
            </linearGradient>
            <linearGradient id={`shadow-grad`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#000" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Ground shadow beneath feet */}
          <ellipse
            cx="50"
            cy="114"
            rx={isMoving ? 22 : 18}
            ry={5}
            fill="url(#shadow-grad)"
          />

          {/* Back Arm */}
          <g
            style={{
              transform: isWinner
                ? 'translate(50px, 48px) rotate(-130deg)'
                : `translate(50px, 48px) rotate(${oppositeAngle * 0.9}deg)`,
              transformOrigin: '0px 0px',
              transition: isWinner ? 'transform 0.4s ease-out' : 'none',
            }}
          >
            {/* Upper arm */}
            <rect
              x="-4"
              y="0"
              width="8"
              height="18"
              rx="4"
              fill={runner.skinColor}
              opacity="0.85"
            />
            {/* Forearm */}
            <g style={{ transform: 'translate(0px, 16px) rotate(65deg)' }}>
              <rect
                x="-3.5"
                y="0"
                width="7"
                height="16"
                rx="3.5"
                fill={runner.skinColor}
                opacity="0.85"
              />
              {/* Fist */}
              <circle cx="0" cy="17" r="4.5" fill={runner.skinColor} />
            </g>
          </g>

          {/* Back Leg */}
          <g
            style={{
              transform: `translate(46px, 75px) rotate(${oppositeAngle}deg)`,
              transformOrigin: '0px 0px',
            }}
          >
            {/* Thigh */}
            <rect
              x="-5"
              y="0"
              width="10"
              height="20"
              rx="5"
              fill={runner.skinColor}
              opacity="0.8"
            />
            {/* Calf / Lower leg */}
            <g style={{ transform: `translate(0px, 18px) rotate(${Math.max(0, -oppositeAngle * 0.9)}deg)` }}>
              <rect
                x="-4"
                y="0"
                width="8"
                height="20"
                rx="4"
                fill={runner.skinColor}
                opacity="0.8"
              />
              {/* Shoe */}
              <path
                d="M -5 18 L 10 18 C 12 18 13 22 10 24 L -6 24 C -7 24 -7 18 -5 18 Z"
                fill="#F97316"
              />
              <rect x="-4" y="16" width="6" height="3" fill="#FFFFFF" />
            </g>
          </g>

          {/* Torso / Athletic Jersey */}
          <g transform="translate(36, 42)">
            {/* Jersey Body */}
            <path
              d="M 4 2 L 24 2 L 26 30 L 2 30 Z"
              fill={`url(#jersey-${runner.id})`}
              rx="4"
            />
            {/* Running Bib */}
            <rect
              x="6"
              y="8"
              width="16"
              height="14"
              rx="2"
              fill="#FFFFFF"
              stroke="#E2E8F0"
              strokeWidth="0.8"
            />
            <text
              x="14"
              y="19"
              textAnchor="middle"
              fontSize="9"
              fontWeight="900"
              fontFamily="sans-serif"
              fill="#0F172A"
            >
              {runner.bib}
            </text>
            <line x1="8" y1="21" x2="20" y2="21" stroke={runner.jerseyColor} strokeWidth="1" />

            {/* Shorts */}
            <path
              d="M 2 30 L 26 30 L 27 40 L 17 40 L 14 34 L 11 40 L 1 40 Z"
              fill={runner.shortsColor}
            />
          </g>

          {/* Front Leg */}
          <g
            style={{
              transform: `translate(54px, 75px) rotate(${angle}deg)`,
              transformOrigin: '0px 0px',
            }}
          >
            {/* Thigh */}
            <rect x="-5" y="0" width="10" height="20" rx="5" fill={runner.skinColor} />
            {/* Calf / Lower leg */}
            <g style={{ transform: `translate(0px, 18px) rotate(${Math.max(0, -angle * 0.9)}deg)` }}>
              <rect x="-4" y="0" width="8" height="20" rx="4" fill={runner.skinColor} />
              {/* Sock */}
              <rect x="-4.5" y="12" width="9" height="6" fill="#F8FAFC" />
              <line x1="-4" y1="14" x2="4" y2="14" stroke={runner.jerseyColor} strokeWidth="1.5" />
              {/* Shoe */}
              <path
                d="M -5 18 L 12 18 C 15 18 15 23 11 24 L -6 24 C -8 24 -7 18 -5 18 Z"
                fill={isPlayer ? '#FACC15' : '#EF4444'}
              />
              <circle cx="2" cy="21" r="1.5" fill="#FFFFFF" />
            </g>
          </g>

          {/* Head & Face */}
          <g transform="translate(36, 14)">
            {/* Neck */}
            <rect x="11" y="24" width="6" height="8" rx="2" fill={runner.skinColor} />

            {/* Head */}
            <circle cx="14" cy="14" r="13" fill={runner.skinColor} />

            {/* Hair */}
            <path
              d="M 1 12 C 1 2 12 -2 24 2 C 28 6 29 14 27 16 C 24 10 18 6 10 9 C 6 11 3 15 1 12 Z"
              fill={runner.hairColor}
            />

            {/* Headband */}
            <rect
              x="2"
              y="7"
              width="24"
              height="5"
              rx="2.5"
              fill={isPlayer ? '#F59E0B' : runner.avatarColor}
            />
            {isPlayer && (
              <polygon
                points="14,6 15,9 18,9 15.5,11 16.5,14 14,12 11.5,14 12.5,11 10,9 13,9"
                fill="#FFFFFF"
                transform="scale(0.5) translate(14, 4)"
              />
            )}

            {/* Face Details */}
            {/* Eyes */}
            {isWinner ? (
              // Happy squinting eyes
              <path
                d="M 15 14 Q 18 10 21 14 M 22 14 Q 25 10 27 14"
                stroke="#0F172A"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            ) : (
              // Determined running eyes looking forward right
              <>
                <circle cx="18" cy="14" r="2" fill="#0F172A" />
                <circle cx="24" cy="14" r="2" fill="#0F172A" />
                <circle cx="19" cy="13.2" r="0.7" fill="#FFFFFF" />
                <circle cx="25" cy="13.2" r="0.7" fill="#FFFFFF" />
              </>
            )}

            {/* Eyebrows (focused angle) */}
            <line
              x1="16"
              y1="10"
              x2="20"
              y2="11"
              stroke="#451A03"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="22"
              y1="11"
              x2="26"
              y2="10"
              stroke="#451A03"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Nose */}
            <circle cx="23" cy="17" r="1" fill="#D97706" opacity="0.6" />

            {/* Mouth */}
            {isWinner ? (
              <path
                d="M 17 19 Q 22 25 26 19 Z"
                fill="#BE123C"
                stroke="#0F172A"
                strokeWidth="1"
              />
            ) : (
              <ellipse cx="21" cy="20" rx="2.5" ry="1.8" fill="#BE123C" />
            )}

            {/* Sweat drop when running */}
            {isMoving && (
              <path
                d="M 5 6 C 5 4 8 2 8 2 C 8 2 10 4 10 6 C 10 7.5 8.5 9 7.5 9 C 6 9 5 7.5 5 6 Z"
                fill="#38BDF8"
                className="animate-pulse"
              />
            )}
          </g>

          {/* Front Arm */}
          <g
            style={{
              transform: isWinner
                ? 'translate(50px, 48px) rotate(-145deg)'
                : `translate(50px, 48px) rotate(${angle * 0.9}deg)`,
              transformOrigin: '0px 0px',
              transition: isWinner ? 'transform 0.4s ease-out' : 'none',
            }}
          >
            {/* Upper arm */}
            <rect x="-4" y="0" width="8" height="18" rx="4" fill={runner.skinColor} />
            {/* Wristband */}
            <rect x="-4" y="10" width="8" height="4" fill={runner.accentColor} />
            {/* Forearm */}
            <g style={{ transform: 'translate(0px, 16px) rotate(65deg)' }}>
              <rect x="-3.5" y="0" width="7" height="16" rx="3.5" fill={runner.skinColor} />
              {/* Fist */}
              <circle cx="0" cy="17" r="5" fill={runner.skinColor} />
            </g>
          </g>
        </svg>

        {/* Speed Wind / Dust Trails when moving */}
        {isMoving && (
          <div className="absolute -left-4 bottom-1 flex flex-col gap-1 pointer-events-none opacity-80">
            <span className="w-4 h-0.5 bg-amber-300 rounded-full animate-ping" />
            <span className="w-6 h-0.5 bg-white/70 rounded-full" />
            <span className="w-3 h-0.5 bg-amber-400 rounded-full" />
          </div>
        )}
      </div>

      {/* Rank badge if finished */}
      {isFinished && rank && (
        <div
          className={`absolute -top-3 right-0 px-1.5 py-0.5 rounded text-[10px] font-black shadow-lg animate-bounce ${
            rank === 1
              ? 'bg-amber-400 text-amber-950 ring-2 ring-yellow-200'
              : rank === 2
              ? 'bg-slate-300 text-slate-900 ring-2 ring-slate-100'
              : 'bg-amber-800 text-amber-100 ring-2 ring-amber-600'
          }`}
        >
          {rank === 1 ? '🥇 1st' : rank === 2 ? '🥈 2nd' : '🥉 3rd'}
        </div>
      )}
    </div>
  );
};
