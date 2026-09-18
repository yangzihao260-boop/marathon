export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export interface DifficultyConfig {
  level: DifficultyLevel;
  name: string;
  englishName: string;
  color: string;
  badgeBg: string;
  rival1FinishSeconds: number; // Duration for rival 1 in seconds
  rival2FinishSeconds: number; // Duration for rival 2 in seconds
  targetClickRate: number; // Estimated clicks/sec required
  description: string;
}

export type RunnerId = 'player' | 'rival1' | 'rival2';

export interface RunnerInfo {
  id: RunnerId;
  name: string;
  titleEn: string;
  bib: string;
  avatarColor: string;
  accentColor: string;
  jerseyColor: string;
  shortsColor: string;
  hairColor: string;
  skinColor: string;
}

export interface RunnerState {
  progress: number; // 0 to 100
  finishTime: number | null; // time in seconds
  rank: number | null; // 1, 2, or 3
  isFinished: boolean;
}

export type GameState = 'idle' | 'countdown' | 'racing' | 'finished';

export interface RaceResult {
  roundNumber: number;
  playerRank: number; // 1, 2, 3
  scoreEarned: number; // 20, 10, 5
  playerTime: number;
  rival1Time: number;
  rival2Time: number;
  difficultyLevel: DifficultyLevel;
  totalClicks: number;
  clicksPerSecond: number;
}

export const TOTAL_CLICKS_TO_FINISH = 30;

export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  1: {
    level: 1,
    name: '慢速模式',
    englishName: 'Slow Pace',
    color: 'from-emerald-500 to-green-600',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    rival1FinishSeconds: 12.2,
    rival2FinishSeconds: 13.0,
    targetClickRate: 2.5,
    description: '选手匀速慢跑（速度已提速2倍），适合初学热身',
  },
  2: {
    level: 2,
    name: '中速模式',
    englishName: 'Moderate Pace',
    color: 'from-blue-500 to-cyan-600',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    rival1FinishSeconds: 8.0,
    rival2FinishSeconds: 8.8,
    targetClickRate: 3.8,
    description: '选手平稳匀速大步跑，节奏适中',
  },
  3: {
    level: 3,
    name: '快速模式',
    englishName: 'Fast Pace',
    color: 'from-amber-500 to-yellow-600',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    rival1FinishSeconds: 5.6,
    rival2FinishSeconds: 6.0,
    targetClickRate: 5.4,
    description: '选手强劲加速，需要保持高频节奏点击',
  },
  4: {
    level: 4,
    name: '极速模式',
    englishName: 'Super Fast',
    color: 'from-orange-500 to-rose-600',
    badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    rival1FinishSeconds: 3.9,
    rival2FinishSeconds: 4.2,
    targetClickRate: 7.7,
    description: '迅猛爆发冲刺，考验极速点击手速',
  },
  5: {
    level: 5,
    name: '超快速模式',
    englishName: 'Ultra Fast',
    color: 'from-purple-600 to-pink-600',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    rival1FinishSeconds: 1.08,
    rival2FinishSeconds: 1.18,
    targetClickRate: 27.8,
    description: '【5倍神速】对手如闪电疾驰！需突破极限疯狂超频狂点！',
  },
};

export const RUNNER_PROFILES: Record<RunnerId, RunnerInfo> = {
  player: {
    id: 'player',
    name: '你 (Player)',
    titleEn: 'Challenger No.1',
    bib: '01',
    avatarColor: '#10B981',
    accentColor: '#F59E0B',
    jerseyColor: '#0EA5E9',
    shortsColor: '#1E293B',
    hairColor: '#451A03',
    skinColor: '#FCD34D',
  },
  rival1: {
    id: 'rival1',
    name: '闪电里奥 (Leo)',
    titleEn: 'Speedy Leo',
    bib: '08',
    avatarColor: '#EF4444',
    accentColor: '#DC2626',
    jerseyColor: '#EF4444',
    shortsColor: '#0F172A',
    hairColor: '#1E1B4B',
    skinColor: '#FBBF24',
  },
  rival2: {
    id: 'rival2',
    name: '飞毛腿米娅 (Mia)',
    titleEn: 'Swift Mia',
    bib: '16',
    avatarColor: '#8B5CF6',
    accentColor: '#A855F7',
    jerseyColor: '#9333EA',
    shortsColor: '#312E81',
    hairColor: '#78350F',
    skinColor: '#FDE68A',
  },
};

export const LEARNING_CONTENT = {
  word: 'marathon',
  phonetic: '/ˈmærəθən/',
  wordTranslation: '马拉松长跑（42.195公里长跑竞赛）',
  sentence: 'Marathon is a long running race.',
  sentenceTranslation: '马拉松是一项长跑比赛。',
  funFact: '马拉松全程标准距离是 42.195 公里（26英里385码），象征着顽强拼搏和永不放弃的坚毅精神！',
};
