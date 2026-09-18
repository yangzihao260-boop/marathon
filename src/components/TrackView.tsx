import React, { useRef } from 'react';
import { RunnerState, RUNNER_PROFILES, RunnerId, TOTAL_CLICKS_TO_FINISH } from '../types';
import { RunnerSvg } from './RunnerSvg';

interface TrackViewProps {
  runnersState: Record<RunnerId, RunnerState>;
  playerClicks: number;
  isRacing: boolean;
  stepCycles: Record<RunnerId, number>;
  onTrackClick?: () => void;
}

export const TrackView: React.FC<TrackViewProps> = ({
  runnersState,
  playerClicks,
  isRacing,
  stepCycles,
  onTrackClick,
}) => {
  const trackContainerRef = useRef<HTMLDivElement>(null);

  // Kilometer distance markers
  const markers = [
    { pct: 0, label: 'START (0km)' },
    { pct: 25, label: '10 km' },
    { pct: 50, label: '21.0975 km (Half)' },
    { pct: 75, label: '35 km' },
    { pct: 100, label: 'FINISH (42.195km)' },
  ];

  // Spectator crowd cheer banners
  const crowdBanners = [
    { text: '🏃 GO MARATHON!', bg: 'bg-rose-500' },
    { text: '⭐ 42.195 KM!', bg: 'bg-amber-500' },
    { text: '🔥 KEEP RUNNING!', bg: 'bg-emerald-500' },
    { text: '🎉 YOU CAN DO IT!', bg: 'bg-sky-500' },
    { text: '🏆 FINISH STRONG!', bg: 'bg-purple-500' },
  ];

  return (
    <div
      ref={trackContainerRef}
      onClick={onTrackClick}
      className="relative w-full rounded-2xl overflow-hidden border-2 border-slate-700/80 bg-slate-950 shadow-2xl select-none cursor-pointer group"
      title="点击赛道任意位置即可向前奔跑！(Click anywhere to run)"
    >
      {/* 1. SCENERY BACKGROUND (Sky, City skyline, Cheering Crowd) */}
      <div className="relative h-28 sm:h-32 bg-gradient-to-b from-sky-400 via-sky-300 to-sky-100 overflow-hidden">
        {/* Sun & Clouds */}
        <div className="absolute top-3 right-12 w-12 h-12 bg-amber-300 rounded-full blur-[1px] shadow-lg shadow-amber-300/60 flex items-center justify-center">
          <span className="text-xl">☀️</span>
        </div>
        <div className="absolute top-4 left-[10%] opacity-80 animate-pulse text-2xl">☁️</div>
        <div className="absolute top-2 left-[55%] opacity-70 text-3xl">☁️</div>
        <div className="absolute top-6 left-[80%] opacity-75 text-xl">☁️</div>

        {/* Hot air balloons & Marathon pennant bunting string */}
        <div className="absolute top-2 left-6 text-xl animate-bounce">🎈</div>
        <div className="absolute top-1 right-[30%] text-xl">🎈</div>

        {/* City Skyline silhouette */}
        <div className="absolute bottom-10 left-0 right-0 h-14 flex items-end justify-between px-2 opacity-35 pointer-events-none">
          <div className="w-8 h-10 bg-slate-700 rounded-t" />
          <div className="w-12 h-14 bg-slate-600 rounded-t" />
          <div className="w-7 h-8 bg-slate-700 rounded-t" />
          <div className="w-14 h-12 bg-slate-500 rounded-t" />
          <div className="w-9 h-11 bg-slate-600 rounded-t" />
          <div className="w-16 h-13 bg-slate-700 rounded-t" />
          <div className="w-10 h-9 bg-slate-600 rounded-t" />
          <div className="w-14 h-14 bg-slate-500 rounded-t" />
        </div>

        {/* Spectator Guardrail & Animated Cheering Crowd */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-slate-800 to-slate-700/90 border-t-2 border-slate-600 flex items-center justify-between px-4 overflow-hidden">
          {crowdBanners.map((b, i) => (
            <div
              key={i}
              className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-black text-white shadow transform -rotate-1 ${b.bg}`}
            >
              {b.text}
            </div>
          ))}

          {/* Cheering crowd avatars */}
          <div className="flex gap-2 text-sm sm:text-base">
            <span className="inline-block animate-bounce" style={{ animationDelay: '0ms' }}>👏</span>
            <span className="inline-block animate-bounce" style={{ animationDelay: '200ms' }}>🙌</span>
            <span className="inline-block animate-bounce" style={{ animationDelay: '100ms' }}>🚩</span>
            <span className="inline-block animate-bounce" style={{ animationDelay: '300ms' }}>📣</span>
            <span className="inline-block animate-bounce" style={{ animationDelay: '150ms' }}>👏</span>
            <span className="inline-block animate-bounce" style={{ animationDelay: '250ms' }}>🎉</span>
          </div>
        </div>
      </div>

      {/* 2. THE RUNNING TRACK (3 LANES, ASPHALT SURFACE) */}
      <div className="relative bg-gradient-to-b from-[#b91c1c] via-[#991b1b] to-[#7f1d1d] py-3 px-8 sm:px-12">
        {/* Track Texture Overlay */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(#ffffff 1px, transparent 1px), radial-gradient(#000000 1px, transparent 1px)',
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0, 8px 8px',
          }}
        />

        {/* START ARCH (Left Side) */}
        <div className="absolute left-2 sm:left-4 top-0 bottom-0 w-8 flex flex-col items-center justify-between z-10 pointer-events-none">
          <div className="bg-amber-400 text-amber-950 font-black text-[9px] px-1.5 py-0.5 rounded shadow border border-amber-300 transform -rotate-90 origin-center whitespace-nowrap">
            START 起点
          </div>
          <div className="h-full w-1.5 bg-white/90 border-r border-dashed border-amber-400" />
          <div className="text-xs">🏁</div>
        </div>

        {/* FINISH ARCH & TAPE (Right Side) */}
        <div className="absolute right-2 sm:right-4 top-0 bottom-0 w-8 flex flex-col items-center justify-between z-10 pointer-events-none">
          <div className="bg-red-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded shadow border border-red-300 transform rotate-90 origin-center whitespace-nowrap animate-pulse">
            FINISH 终点
          </div>
          {/* Checkered Finish Line */}
          <div
            className="h-full w-3 border-x border-white shadow-lg"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, #fff 0px, #fff 10px, #111 10px, #111 20px)',
            }}
          />
          <div className="text-xs">🏆</div>
        </div>

        {/* Track Distance Markers (painted on the floor) */}
        <div className="absolute top-1 left-12 right-12 flex justify-between text-[10px] font-bold text-white/50 tracking-wider pointer-events-none">
          {markers.map((m, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <span className="h-2 w-0.5 bg-white/40 mb-0.5" />
              <span>{m.label}</span>
            </div>
          ))}
        </div>

        {/* THE THREE LANES */}
        <div className="relative flex flex-col gap-2 pt-5 pb-1">
          {/* LANE 1: Rival 1 (Leo) */}
          <div className="relative h-24 sm:h-28 border-b-2 border-dashed border-white/40 flex items-center">
            <div className="absolute left-0 text-[11px] font-bold text-white/40 font-mono pl-1">
              LANE 1
            </div>
            {/* Runner Position along track */}
            <div
              className={`absolute will-change-[left] ${
                !isRacing ? 'transition-[left] duration-300 ease-out' : ''
              }`}
              style={{
                left: `calc(${Math.min(runnersState.rival1.progress, 100)}% * 0.82 + 20px)`,
                transform: 'translateX(-50%)',
              }}
            >
              <RunnerSvg
                runner={RUNNER_PROFILES.rival1}
                isMoving={isRacing && !runnersState.rival1.isFinished}
                stepCycle={stepCycles.rival1}
                isFinished={runnersState.rival1.isFinished}
                rank={runnersState.rival1.rank}
              />
            </div>
          </div>

          {/* LANE 2: Player (You) - HIGHLIGHTED */}
          <div className="relative h-24 sm:h-28 border-b-2 border-dashed border-white/40 flex items-center bg-black/10 rounded-lg">
            <div className="absolute left-0 text-[11px] font-bold text-amber-300 font-mono pl-1 flex items-center gap-1">
              <span>LANE 2</span>
              <span className="bg-amber-400 text-amber-950 text-[9px] px-1 rounded font-sans font-black">
                YOU
              </span>
            </div>
            {/* Runner Position along track: 30 clicks = 100% */}
            <div
              className="absolute transition-[left] ease-out duration-75 will-change-[left]"
              style={{
                left: `calc(${Math.min(runnersState.player.progress, 100)}% * 0.82 + 20px)`,
                transform: 'translateX(-50%)',
              }}
            >
              <RunnerSvg
                runner={RUNNER_PROFILES.player}
                isMoving={isRacing && !runnersState.player.isFinished}
                stepCycle={stepCycles.player}
                isFinished={runnersState.player.isFinished}
                rank={runnersState.player.rank}
                isPlayer={true}
              />
            </div>
          </div>

          {/* LANE 3: Rival 2 (Mia) */}
          <div className="relative h-24 sm:h-28 flex items-center">
            <div className="absolute left-0 text-[11px] font-bold text-white/40 font-mono pl-1">
              LANE 3
            </div>
            {/* Runner Position along track */}
            <div
              className={`absolute will-change-[left] ${
                !isRacing ? 'transition-[left] duration-300 ease-out' : ''
              }`}
              style={{
                left: `calc(${Math.min(runnersState.rival2.progress, 100)}% * 0.82 + 20px)`,
                transform: 'translateX(-50%)',
              }}
            >
              <RunnerSvg
                runner={RUNNER_PROFILES.rival2}
                isMoving={isRacing && !runnersState.rival2.isFinished}
                stepCycle={stepCycles.rival2}
                isFinished={runnersState.rival2.isFinished}
                rank={runnersState.rival2.rank}
              />
            </div>
          </div>
        </div>

        {/* 30-STEP PROGRESS RULER (Visualizing the 30 clicks frequency) */}
        <div className="mt-2 pt-2 border-t border-red-900/60 flex items-center justify-between px-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-white/80 font-bold">🏃 步数进度:</span>
            <div className="flex items-center gap-1 font-mono font-black text-amber-300 text-sm">
              <span>{playerClicks}</span>
              <span className="text-white/40">/</span>
              <span>{TOTAL_CLICKS_TO_FINISH}</span>
              <span className="text-[11px] text-white/70 font-normal ml-1">
                (每次点击前进 1/30 赛程)
              </span>
            </div>
          </div>

          <div className="text-right font-mono text-xs text-amber-300 font-semibold">
            {Math.min(100, Math.round((playerClicks / TOTAL_CLICKS_TO_FINISH) * 100))}%
          </div>
        </div>

        {/* Real-time Click Progress Bar */}
        <div className="w-full h-2 bg-slate-900/80 rounded-full overflow-hidden mt-1 p-0.5 border border-white/20">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-75 shadow-sm"
            style={{
              width: `${Math.min(100, (playerClicks / TOTAL_CLICKS_TO_FINISH) * 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
