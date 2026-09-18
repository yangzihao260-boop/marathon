import React, { useEffect, useState } from 'react';
import { RaceResult, DIFFICULTY_CONFIGS, LEARNING_CONTENT, RUNNER_PROFILES } from '../types';
import { Trophy, Medal, Volume2, RotateCcw, ArrowRight, Sparkles, Home, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/soundEngine';

interface RaceResultModalProps {
  result: RaceResult;
  onBackToStart: () => void; // Returns to initial page so user can re-choose speed
  onRestartSameSpeed: () => void; // Restarts with current speed
  onNextLevel?: () => void;
}

export const RaceResultModal: React.FC<RaceResultModalProps> = ({
  result,
  onBackToStart,
  onRestartSameSpeed,
  onNextLevel,
}) => {
  const [isPlayingSentence, setIsPlayingSentence] = useState(false);

  // Safe normalized rank: strictly 1, 2, or 3
  const safeRank = (result?.playerRank === 1 || result?.playerRank === 2 || result?.playerRank === 3)
    ? result.playerRank
    : result?.scoreEarned === 20 ? 1 : result?.scoreEarned === 10 ? 2 : 3;

  useEffect(() => {
    try {
      if (safeRank === 1) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'],
        });
        const timer = setTimeout(() => {
          confetti({
            particleCount: 80,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 80,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
          });
        }, 350);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore confetti errors if any
    }
  }, [safeRank]);

  const handleReadSentence = () => {
    setIsPlayingSentence(true);
    soundEngine.speakEnglish(LEARNING_CONTENT.sentence, () => {
      setIsPlayingSentence(false);
    });
  };

  const rankConfig = {
    1: {
      title: '🏆 冠军 · 第一名！',
      subtitle: '太棒了！你的冲刺手速超越了所有对手！',
      badge: '获得 20 分！',
      score: 20,
      textColor: 'text-amber-400',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/50',
      border: 'border-amber-400/80',
      glow: 'from-amber-500/30 to-yellow-600/20',
      icon: Trophy,
    },
    2: {
      title: '🥈 亚军 · 第二名！',
      subtitle: '非常优秀！仅差一步就能斩获冠军！',
      badge: '获得 10 分！',
      score: 10,
      textColor: 'text-slate-200',
      badgeBg: 'bg-slate-400/20 text-slate-200 border-slate-400/50',
      border: 'border-slate-300/80',
      glow: 'from-slate-400/30 to-slate-600/20',
      icon: Medal,
    },
    3: {
      title: '🥉 季军 · 第三名！',
      subtitle: '坚持就是胜利！马拉松是一场长跑，继续加油！',
      badge: '获得 5 分！',
      score: 5,
      textColor: 'text-amber-500',
      badgeBg: 'bg-amber-700/20 text-amber-400 border-amber-600/50',
      border: 'border-amber-600/80',
      glow: 'from-amber-700/30 to-amber-900/20',
      icon: Medal,
    },
  }[safeRank];

  // Standings list sorted by finish time
  const standings = [
    {
      id: 'player',
      name: `${RUNNER_PROFILES.player.name} (你)`,
      bib: RUNNER_PROFILES.player.bib,
      time: result?.playerTime ?? 0,
      isPlayer: true,
      color: RUNNER_PROFILES.player.avatarColor,
    },
    {
      id: 'rival1',
      name: RUNNER_PROFILES.rival1.name,
      bib: RUNNER_PROFILES.rival1.bib,
      time: result?.rival1Time ?? 0,
      isPlayer: false,
      color: RUNNER_PROFILES.rival1.avatarColor,
    },
    {
      id: 'rival2',
      name: RUNNER_PROFILES.rival2.name,
      bib: RUNNER_PROFILES.rival2.bib,
      time: result?.rival2Time ?? 0,
      isPlayer: false,
      color: RUNNER_PROFILES.rival2.avatarColor,
    },
  ].sort((a, b) => a.time - b.time);

  const diffConfig = DIFFICULTY_CONFIGS[result.difficultyLevel] || DIFFICULTY_CONFIGS[1];

  const IconComponent = rankConfig.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div
        className={`relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-850 to-slate-950 border-2 ${rankConfig.border} rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden my-auto`}
      >
        {/* Glow ambient background */}
        <div
          className={`absolute -top-20 -left-20 w-48 h-48 bg-gradient-to-br ${rankConfig.glow} rounded-full blur-3xl pointer-events-none`}
        />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* 1. Header & Player Final Ranking */}
        <div className="text-center relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 shadow-xl shadow-amber-500/40 mb-3 border-4 border-amber-300 transform hover:scale-105 transition-transform">
            <IconComponent className="w-10 h-10" />
          </div>

          <div className="text-xs font-bold text-slate-400 mb-1 tracking-wider uppercase">
            — 本轮马拉松最终排名 —
          </div>

          <h2 className={`text-2xl sm:text-3xl font-black ${rankConfig.textColor} tracking-wide`}>
            {rankConfig.title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {rankConfig.subtitle}
          </p>

          <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-inner bg-slate-900/90 border-amber-400/50">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-base sm:text-lg font-black text-amber-300">
              +{rankConfig.score} 分
            </span>
            <span className="text-xs text-slate-400 font-normal">
              ({diffConfig.name})
            </span>
          </div>
        </div>

        {/* 2. Detailed Race Standings Table (Player vs Rivals) */}
        <div className="my-4 bg-slate-950/80 rounded-2xl p-3 border border-slate-800">
          <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center justify-between px-1">
            <span>🏁 选手成绩总榜 (Rankings)</span>
            <span>用时 (Time)</span>
          </div>

          <div className="space-y-1.5">
            {standings.map((item, index) => {
              const rankNum = index + 1;
              const isCurrentUser = item.isPlayer;
              const medals = ['🥇', '🥈', '🥉'];

              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all ${
                    isCurrentUser
                      ? 'bg-amber-400/15 border border-amber-400/50 text-white ring-1 ring-amber-400/30'
                      : 'bg-slate-900/60 border border-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{medals[index] || `#${rankNum}`}</span>
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className={isCurrentUser ? 'font-black text-amber-300' : ''}>
                      {item.name}
                    </span>
                    {isCurrentUser && (
                      <span className="bg-amber-400 text-slate-950 text-[9px] px-1 rounded font-black">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="font-mono font-black text-sm text-slate-200">
                    {item.time.toFixed(2)}s
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats bar */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="bg-slate-900/90 py-1.5 px-2 rounded-lg">
              <span className="text-slate-400 block text-[10px]">点击步数</span>
              <span className="font-mono font-bold text-amber-300">
                {result.totalClicks} 下完成
              </span>
            </div>
            <div className="bg-slate-900/90 py-1.5 px-2 rounded-lg">
              <span className="text-slate-400 block text-[10px]">平均点击手速</span>
              <span className="font-mono font-bold text-emerald-400">
                {result.clicksPerSecond.toFixed(1)} 次/秒
              </span>
            </div>
          </div>
        </div>

        {/* 3. Kids Classroom English Repeat-After-Me Box */}
        <div className="mb-4 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 border border-indigo-500/40 rounded-2xl p-3">
          <div className="flex items-center justify-between text-xs text-indigo-300 font-bold mb-1">
            <span>🎉 课后大声跟读（核心句型）：</span>
            <span className="text-[11px] text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
              全班齐读
            </span>
          </div>

          <p className="text-base sm:text-lg font-black text-white text-center my-1 tracking-wide">
            “<span className="text-amber-300">Marathon</span> is a long running race.”
          </p>
          <p className="text-xs text-slate-300 text-center mb-2">
            马拉松是一项长跑比赛。
          </p>

          <button
            onClick={handleReadSentence}
            disabled={isPlayingSentence}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Volume2 className={`w-4 h-4 ${isPlayingSentence ? 'animate-bounce' : ''}`} />
            <span>{isPlayingSentence ? '朗读中...' : '点击跟读句子：Marathon is a long running race.'}</span>
          </button>
        </div>

        {/* 4. Refresh notification */}
        <div className="mb-4 text-center text-xs text-slate-400 bg-slate-900/60 py-1.5 px-3 rounded-xl border border-slate-800">
          💡 规则提示：选择继续后将<strong>刷新清空得分</strong>，返回初始页面重新选择速度！
        </div>

        {/* 5. Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* PRIMARY BUTTON: Go back to initial page to re-select speed */}
          <button
            onClick={onBackToStart}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 active:scale-95 text-slate-950 font-black text-sm transition-all shadow-xl shadow-amber-500/30 cursor-pointer"
          >
            <Home className="w-4 h-4 fill-slate-950" />
            <span>继续（返回重新选择速度）</span>
          </button>

          {/* SECONDARY BUTTON: Play again at same speed */}
          <button
            onClick={onRestartSameSpeed}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-sm border border-slate-700 transition-all shadow-md cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>原速度再跑一轮</span>
          </button>
        </div>

        {result.difficultyLevel < 5 && onNextLevel && (
          <div className="mt-2 text-center">
            <button
              onClick={onNextLevel}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold inline-flex items-center gap-1 py-1 hover:underline cursor-pointer"
            >
              <span>直接进阶下一难度（{DIFFICULTY_CONFIGS[(result.difficultyLevel + 1) as 2 | 3 | 4 | 5]?.name}）</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
