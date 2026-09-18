import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  DifficultyLevel,
  DIFFICULTY_CONFIGS,
  RunnerId,
  RunnerState,
  GameState,
  RaceResult,
  TOTAL_CLICKS_TO_FINISH,
} from './types';
import { soundEngine } from './utils/soundEngine';
import { EnglishLearningBar } from './components/EnglishLearningBar';
import { DifficultySelector } from './components/DifficultySelector';
import { TrackView } from './components/TrackView';
import { RaceResultModal } from './components/RaceResultModal';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Play,
  Flame,
  Award,
  Maximize2,
  Minimize2,
  Sparkles,
} from 'lucide-react';

export default function App() {
  // Difficulty: 1 to 5
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(1);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [countdownNum, setCountdownNum] = useState<number | string>(3);

  // Audio mute state
  const [isMuted, setIsMuted] = useState(false);

  // Player clicks: exactly 0 to 30
  const [playerClicks, setPlayerClicks] = useState<number>(0);

  // Round score: resets every round as requested
  const [currentRoundScore, setCurrentRoundScore] = useState<number>(0);
  const [roundCount, setRoundCount] = useState<number>(1);

  // Runners state
  const [runnersState, setRunnersState] = useState<Record<RunnerId, RunnerState>>({
    player: { progress: 0, finishTime: null, rank: null, isFinished: false },
    rival1: { progress: 0, finishTime: null, rank: null, isFinished: false },
    rival2: { progress: 0, finishTime: null, rank: null, isFinished: false },
  });

  // Step cycles for running animations (0 to 1)
  const [stepCycles, setStepCycles] = useState<Record<RunnerId, number>>({
    player: 0,
    rival1: 0,
    rival2: 0,
  });

  // Race timing and tracking
  const raceStartTimeRef = useRef<number>(0);
  const isRaceActiveRef = useRef<boolean>(false);
  const finishHandledRef = useRef<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [raceResult, setRaceResult] = useState<RaceResult | null>(null);

  // Click rate tracker (CPS)
  const clickTimestampsRef = useRef<number[]>([]);
  const [clicksPerSec, setClicksPerSec] = useState<number>(0);

  // Tap ripple effect coordinates
  const [tapRipples, setTapRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  // Fullscreen toggle
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    soundEngine.setMuted(nextMute);
  };

  // Fullscreen Handler
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  /**
   * Reset round state - strictly ensures scores and runners refresh fresh
   */
  const resetRound = useCallback(() => {
    soundEngine.stopBGM();
    isRaceActiveRef.current = false;
    finishHandledRef.current = false;
    setGameState('idle');
    setPlayerClicks(0);
    setCurrentRoundScore(0);
    setElapsedTime(0);
    setClicksPerSec(0);
    setRaceResult(null);
    clickTimestampsRef.current = [];

    setRunnersState({
      player: { progress: 0, finishTime: null, rank: null, isFinished: false },
      rival1: { progress: 0, finishTime: null, rank: null, isFinished: false },
      rival2: { progress: 0, finishTime: null, rank: null, isFinished: false },
    });

    setStepCycles({
      player: 0,
      rival1: 0,
      rival2: 0,
    });
  }, []);

  // When changing difficulty level, reset round
  const handleSelectDifficulty = (lvl: DifficultyLevel) => {
    if (gameState === 'racing' || gameState === 'countdown') return;
    setDifficulty(lvl);
    resetRound();
  };

  /**
   * Conclude race and show final ranking safely
   */
  const handleFinishRace = useCallback(
    (playerFinishTime: number) => {
      if (finishHandledRef.current) return;
      finishHandledRef.current = true;
      isRaceActiveRef.current = false;

      soundEngine.stopBGM();

      const config = DIFFICULTY_CONFIGS[difficulty];
      const r1Time = config.rival1FinishSeconds;
      const r2Time = config.rival2FinishSeconds;

      // Ranking strictly calculated:
      // 1st place: beats both rivals
      // 2nd place: beats one rival
      // 3rd place: rivals finish first
      let rank: 1 | 2 | 3 = 1;
      if (playerFinishTime < r1Time && playerFinishTime < r2Time) {
        rank = 1;
      } else if (playerFinishTime < Math.max(r1Time, r2Time)) {
        rank = 2;
      } else {
        rank = 3;
      }

      // 1st place = 20 pts, 2nd place = 10 pts, 3rd place = 5 pts
      const score = rank === 1 ? 20 : rank === 2 ? 10 : 5;
      setCurrentRoundScore(score);
      soundEngine.playFinishSound(rank);

      const cps = Number(
        (TOTAL_CLICKS_TO_FINISH / Math.max(0.1, playerFinishTime)).toFixed(1)
      );

      // Determine rivals' ranks
      let r1Rank = 2;
      let r2Rank = 3;
      if (rank === 1) {
        if (r1Time <= r2Time) {
          r1Rank = 2;
          r2Rank = 3;
        } else {
          r1Rank = 3;
          r2Rank = 2;
        }
      } else if (rank === 2) {
        if (r1Time <= playerFinishTime) {
          r1Rank = 1;
          r2Rank = 3;
        } else {
          r1Rank = 3;
          r2Rank = 1;
        }
      } else {
        // rank === 3
        if (r1Time <= r2Time) {
          r1Rank = 1;
          r2Rank = 2;
        } else {
          r1Rank = 2;
          r2Rank = 1;
        }
      }

      setRunnersState({
        player: {
          progress: 100,
          finishTime: playerFinishTime,
          rank,
          isFinished: true,
        },
        rival1: {
          progress: 100,
          finishTime: r1Time,
          rank: r1Rank,
          isFinished: true,
        },
        rival2: {
          progress: 100,
          finishTime: r2Time,
          rank: r2Rank,
          isFinished: true,
        },
      });

      const resultObj: RaceResult = {
        roundNumber: roundCount,
        playerRank: rank,
        scoreEarned: score,
        playerTime: Number(playerFinishTime.toFixed(2)),
        rival1Time: Number(r1Time.toFixed(2)),
        rival2Time: Number(r2Time.toFixed(2)),
        difficultyLevel: difficulty,
        totalClicks: TOTAL_CLICKS_TO_FINISH,
        clicksPerSecond: cps,
      };

      setRaceResult(resultObj);
      setGameState('finished');
    },
    [difficulty, roundCount]
  );

  /**
   * Start Race with 3, 2, 1, GO! countdown
   */
  const startCountdown = () => {
    resetRound();
    setGameState('countdown');
    setCountdownNum(3);
    soundEngine.playCountdownBeep(false);

    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdownNum(count);
        soundEngine.playCountdownBeep(false);
      } else if (count === 0) {
        setCountdownNum('GO! 🏃');
        soundEngine.playCountdownBeep(true);
      } else {
        clearInterval(interval);
        // Start Race!
        finishHandledRef.current = false;
        isRaceActiveRef.current = true;
        setGameState('racing');
        raceStartTimeRef.current = performance.now();
        soundEngine.startBGM(difficulty);
      }
    }, 750);
  };

  /**
   * Handle Click / Tap to advance Player
   * "从起点到终点要点击30下，按照这个频率来确定每次移动的距离。"
   */
  const handlePlayerTap = useCallback(
    (e?: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
      if (gameState !== 'racing') {
        if (gameState === 'idle') {
          startCountdown();
        }
        return;
      }

      if (finishHandledRef.current) return;

      setPlayerClicks((prev) => {
        if (prev >= TOTAL_CLICKS_TO_FINISH) return prev;
        const nextClicks = prev + 1;

        // Sound effect on every click!
        soundEngine.playTapSound(nextClicks);

        // Record timestamp for CPS
        const now = performance.now();
        clickTimestampsRef.current.push(now);

        // Visual tap ripple
        if (e && 'clientX' in e && e.clientX > 0) {
          const newRipple = {
            id: Date.now() + Math.random(),
            x: e.clientX,
            y: e.clientY,
          };
          setTapRipples((r) => [...r.slice(-5), newRipple]);
          setTimeout(() => {
            setTapRipples((r) => r.filter((item) => item.id !== newRipple.id));
          }, 450);
        }

        // Advance player's running limb cycle
        setStepCycles((cycles) => ({
          ...cycles,
          player: (cycles.player + 0.18) % 1,
        }));

        const newProgress = Math.min(
          100,
          (nextClicks / TOTAL_CLICKS_TO_FINISH) * 100
        );

        setRunnersState((st) => ({
          ...st,
          player: {
            ...st.player,
            progress: newProgress,
            isFinished: nextClicks >= TOTAL_CLICKS_TO_FINISH,
          },
        }));

        // If player reaches 30 clicks, player finishes the race!
        if (nextClicks >= TOTAL_CLICKS_TO_FINISH) {
          const finishTime = (now - raceStartTimeRef.current) / 1000;
          handleFinishRace(finishTime);
        }

        return nextClicks;
      });
    },
    [gameState, difficulty, handleFinishRace]
  );

  // Keyboard controls: Spacebar, Enter, ArrowRight
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' ||
        e.code === 'Enter' ||
        e.code === 'ArrowRight' ||
        e.code === 'ArrowUp'
      ) {
        e.preventDefault();
        handlePlayerTap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayerTap]);

  /**
   * AI Competitors & Main Game Loop:
   * Competitors run with pure uniform constant speed (匀速前进),
   * completely decoupled from player clicks and 100% stutter-free!
   */
  useEffect(() => {
    if (gameState !== 'racing') return;

    let animId: number;
    const config = DIFFICULTY_CONFIGS[difficulty];
    const durationRival1 = config.rival1FinishSeconds;
    const durationRival2 = config.rival2FinishSeconds;

    const tick = () => {
      if (!isRaceActiveRef.current) return;

      const now = performance.now();
      const elapsed = (now - raceStartTimeRef.current) / 1000;
      setElapsedTime(elapsed);

      // Clean up CPS clicks older than 1.2s
      const recentClicks = clickTimestampsRef.current.filter(
        (t) => now - t <= 1200
      );
      clickTimestampsRef.current = recentClicks;
      setClicksPerSec(Number((recentClicks.length / 1.2).toFixed(1)));

      // Calculate uniform, constant linear progress for competitors
      const r1Prog = Math.min((elapsed / durationRival1) * 100, 100);
      const r2Prog = Math.min((elapsed / durationRival2) * 100, 100);

      const r1Done = elapsed >= durationRival1;
      const r2Done = elapsed >= durationRival2;

      // Steady limb movement matching their running cadence
      setStepCycles((cycles) => ({
        ...cycles,
        rival1: r1Done ? 0 : (elapsed * 5.0) % 1,
        rival2: r2Done ? 0 : (elapsed * 4.6) % 1,
      }));

      setRunnersState((prev) => ({
        ...prev,
        rival1: {
          ...prev.rival1,
          progress: r1Prog,
          isFinished: r1Done,
          finishTime: r1Done ? durationRival1 : null,
        },
        rival2: {
          ...prev.rival2,
          progress: r2Prog,
          isFinished: r2Done,
          finishTime: r2Done ? durationRival2 : null,
        },
      }));

      // Timeout safety: if rivals finished long ago and player stopped clicking, conclude race
      if (
        r1Done &&
        r2Done &&
        elapsed > Math.max(durationRival1, durationRival2) + 5.0 &&
        !finishHandledRef.current
      ) {
        handleFinishRace(elapsed);
        return;
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [gameState, difficulty, handleFinishRace]);

  /**
   * Action: Go back to initial page to re-select speed and play next round
   * "选择继续后重新回到最开始的页面，重新选择速度再进行下一轮"
   * "每次结束一轮，所有得分都要刷新"
   */
  const handleBackToStart = () => {
    setRoundCount((r) => r + 1);
    resetRound();
  };

  /**
   * Action: Restart at the same speed immediately
   */
  const handleRestartSameSpeed = () => {
    setRoundCount((r) => r + 1);
    startCountdown();
  };

  /**
   * Action: Proceed to next difficulty level
   */
  const handleNextLevel = () => {
    if (difficulty < 5) {
      setDifficulty((d) => (d + 1) as DifficultyLevel);
    }
    setRoundCount((r) => r + 1);
    startCountdown();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-3 sm:p-5 relative overflow-x-hidden font-sans select-none">
      {/* Click Ripples */}
      {tapRipples.map((rip) => (
        <div
          key={rip.id}
          className="fixed pointer-events-none rounded-full border-2 border-amber-300/80 bg-amber-400/20 animate-ping z-50"
          style={{
            left: rip.x - 25,
            top: rip.y - 25,
            width: 50,
            height: 50,
          }}
        />
      ))}

      {/* TOP NAV & TOOLBAR */}
      <header className="w-full max-w-5xl flex items-center justify-between py-2 border-b border-slate-800/80 mb-3">
        {/* App Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 text-xl font-black">
            🏃
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
              <span>Marathon Runner</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                马拉松英语冲刺赛
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              英语教学备课专用 · 点击屏幕冲刺，对比速度抢先夺冠
            </p>
          </div>
        </div>

        {/* Right Tools: Mute, Fullscreen, Reset */}
        <div className="flex items-center gap-2">
          {/* Mute Audio Button */}
          <button
            onClick={handleToggleMute}
            className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1.5 font-bold cursor-pointer ${
              isMuted
                ? 'bg-red-500/20 text-red-300 border-red-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title={isMuted ? '取消静音 (开启音效与音乐)' : '静音'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4 text-amber-400" />
            )}
            <span className="hidden md:inline">
              {isMuted ? '静音中' : '音乐音效'}
            </span>
          </button>

          {/* Fullscreen Button for Classroom Projection */}
          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
            title="全屏教室投影"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          {/* Reset Round */}
          <button
            onClick={resetRound}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
            title="刷新重置本轮比赛"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT WRAPPER */}
      <main className="w-full max-w-5xl flex flex-col gap-3 sm:gap-4 flex-1">
        {/* 1. TEACHING SECTION: LEARNING "marathon" & "Marathon is a long running race." */}
        <EnglishLearningBar />

        {/* 2. DIFFICULTY CONTROLLER (5 LEVELS) - Fully selectable in idle state */}
        <DifficultySelector
          currentLevel={difficulty}
          onSelectLevel={handleSelectDifficulty}
          disabled={gameState === 'racing' || gameState === 'countdown'}
        />

        {/* 3. GAME STATUS DASHBOARD */}
        <div className="w-full bg-slate-900/90 rounded-2xl p-3 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-sm shadow-md">
          {/* Left stats: Score & Rules */}
          <div className="flex items-center gap-3">
            {/* Current Round Score */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/40 text-amber-300 font-bold">
              <Award className="w-4 h-4 text-amber-400" />
              <span>本轮得分: </span>
              <span className="font-mono text-base font-black text-amber-400">
                {currentRoundScore}
              </span>
              <span className="text-xs text-amber-300/70 font-normal">分</span>
            </div>

            {/* Score Rules Pill */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span className="text-amber-400 font-bold">🥇1st: 20分</span>
              <span className="text-slate-300 font-bold">🥈2nd: 10分</span>
              <span className="text-amber-600 font-bold">🥉3rd: 5分</span>
              <span className="text-[11px] text-slate-500">(每轮刷新)</span>
            </div>
          </div>

          {/* Right stats: Speed / CPS / Timer */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 font-mono text-xs">
              <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
              <span className="text-slate-400">手速: </span>
              <span className="font-black text-emerald-400">{clicksPerSec}</span>
              <span className="text-[10px] text-slate-400">次/s</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 font-mono text-xs">
              <span className="text-slate-400">计时: </span>
              <span className="font-bold text-white">
                {elapsedTime.toFixed(1)}s
              </span>
            </div>
          </div>
        </div>

        {/* 4. THE MARATHON RACE TRACK */}
        <div className="relative">
          <TrackView
            runnersState={runnersState}
            playerClicks={playerClicks}
            isRacing={gameState === 'racing'}
            stepCycles={stepCycles}
            onTrackClick={gameState === 'racing' ? handlePlayerTap : undefined}
          />

          {/* Countdown Overlay (3, 2, 1, GO!) */}
          {gameState === 'countdown' && (
            <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center rounded-2xl pointer-events-none">
              <div className="text-7xl sm:text-8xl font-black text-amber-300 drop-shadow-2xl animate-pulse font-serif tracking-widest">
                {countdownNum}
              </div>
              <div className="mt-2 text-sm sm:text-base font-bold text-white bg-slate-900/90 px-4 py-1 rounded-full border border-amber-400/40">
                准备冲刺！Ready, Set...
              </div>
            </div>
          )}

          {/* Ready Overlay before Start (Initial Page) */}
          {gameState === 'idle' && (
            <div className="absolute inset-0 z-20 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center rounded-2xl p-4">
              <div className="text-center max-w-md">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>30次点击冲过终点线</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
                  准备好与选手进行马拉松竞赛了吗？
                </h3>
                <p className="text-xs text-slate-300 mb-4">
                  可在上方点击选择任意速度，然后点击【开始比赛】！
                </p>
                <button
                  onClick={startCountdown}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 active:scale-95 text-slate-950 font-black text-base shadow-xl shadow-amber-500/40 flex items-center gap-2 mx-auto transition-all cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-slate-950" />
                  <span>开始比赛 (Start Race)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 5. INTERACTIVE TAPPING CONTROLLER & INSTRUCTION */}
        <div className="w-full bg-slate-900/80 rounded-2xl p-3 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Instruction Note */}
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>
              💡 冲刺秘诀：按<strong>空格键 (Space)</strong>、
              <strong>回车 (Enter)</strong> 或连续点击下方按钮/赛道均可极速冲刺！
            </span>
          </div>

          {/* GIANT ACTION BUTTON (Tapping Button for Mobile & Classroom Smartboard) */}
          <button
            onClick={gameState === 'racing' ? handlePlayerTap : startCountdown}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-base tracking-wide flex items-center justify-center gap-2 shadow-2xl transition-all select-none active:scale-90 cursor-pointer ${
              gameState === 'racing'
                ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 ring-4 ring-amber-300/50 shadow-amber-400/40 animate-pulse'
                : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-400 hover:to-green-500'
            }`}
          >
            <span className="text-2xl">🏃</span>
            <span>
              {gameState === 'racing'
                ? `猛击冲刺！TAP TO RUN (${playerClicks}/${TOTAL_CLICKS_TO_FINISH})`
                : '点击开始比赛 (Start!)'}
            </span>
          </button>
        </div>
      </main>

      {/* 6. RACE RESULT MODAL (Clear final ranking, refresh score, return to initial page) */}
      {gameState === 'finished' && raceResult && (
        <RaceResultModal
          result={raceResult}
          onBackToStart={handleBackToStart}
          onRestartSameSpeed={handleRestartSameSpeed}
          onNextLevel={difficulty < 5 ? handleNextLevel : undefined}
        />
      )}

      {/* FOOTER */}
      <footer className="w-full max-w-5xl text-center py-2 text-[11px] text-slate-500 border-t border-slate-900 mt-3">
        马拉松教学游戏 (Marathon English Learning Game) · 词汇：marathon · 句型：Marathon is a long running race.
      </footer>
    </div>
  );
}
