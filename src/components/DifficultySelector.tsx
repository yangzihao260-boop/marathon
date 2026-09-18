import React from 'react';
import { DifficultyLevel, DIFFICULTY_CONFIGS } from '../types';
import { Gauge, Zap } from 'lucide-react';

interface DifficultySelectorProps {
  currentLevel: DifficultyLevel;
  onSelectLevel: (level: DifficultyLevel) => void;
  disabled?: boolean;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  currentLevel,
  onSelectLevel,
  disabled = false,
}) => {
  const levels: DifficultyLevel[] = [1, 2, 3, 4, 5];

  return (
    <div className="w-full bg-slate-800/80 backdrop-blur rounded-2xl p-3 sm:p-4 border border-slate-700/80 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Gauge className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-slate-100">
            赛道难度选择（5个模式）
          </span>
          <span className="text-xs text-slate-400">
            对手跑步速度逐级递增
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>当前推荐点击频率:</span>
          <span className="font-mono font-bold text-amber-300">
            ~{DIFFICULTY_CONFIGS[currentLevel].targetClickRate} 次/秒
          </span>
        </div>
      </div>

      {/* 5 Difficulty Tabs */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5">
        {levels.map((lvl) => {
          const config = DIFFICULTY_CONFIGS[lvl];
          const isSelected = currentLevel === lvl;

          return (
            <button
              key={lvl}
              onClick={() => !disabled && onSelectLevel(lvl)}
              disabled={disabled}
              className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all select-none border text-center ${
                disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer active:scale-95'
              } ${
                isSelected
                  ? `bg-gradient-to-b ${config.color} text-white border-white/60 shadow-lg ring-2 ring-white/30 scale-102`
                  : 'bg-slate-900/70 hover:bg-slate-700/60 text-slate-300 border-slate-700'
              }`}
            >
              {/* Level indicator */}
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                L{lvl}
              </span>
              <span className="text-xs sm:text-sm font-black whitespace-nowrap">
                {config.name}
              </span>
              <span className="hidden sm:inline-block text-[10px] font-medium opacity-90 truncate max-w-full">
                {config.englishName}
              </span>

              {/* Speed Bars */}
              <div className="flex gap-0.5 mt-1.5">
                {[1, 2, 3, 4, 5].map((bar) => (
                  <span
                    key={bar}
                    className={`w-1 h-2 rounded-xs ${
                      bar <= lvl
                        ? isSelected
                          ? 'bg-white shadow-xs'
                          : 'bg-amber-400'
                        : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Mode Description */}
      <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-700/50 flex items-center justify-between text-xs">
        <span className="text-slate-300">
          <strong className="text-amber-300">{DIFFICULTY_CONFIGS[currentLevel].name}: </strong>
          {DIFFICULTY_CONFIGS[currentLevel].description}
        </span>
        <span className="text-[11px] text-slate-400 hidden md:inline">
          对手耗时约 {DIFFICULTY_CONFIGS[currentLevel].rival1FinishSeconds.toFixed(1)} 秒
        </span>
      </div>
    </div>
  );
};
