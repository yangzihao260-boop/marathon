import React, { useState } from 'react';
import { Volume2, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import { LEARNING_CONTENT } from '../types';
import { soundEngine } from '../utils/soundEngine';

export const EnglishLearningBar: React.FC = () => {
  const [isPlayingWord, setIsPlayingWord] = useState(false);
  const [isPlayingSentence, setIsPlayingSentence] = useState(false);

  const handlePlayWord = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlayingWord(true);
    soundEngine.speakEnglish('marathon', () => {
      setIsPlayingWord(false);
    });
  };

  const handlePlaySentence = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlayingSentence(true);
    soundEngine.speakEnglish(LEARNING_CONTENT.sentence, () => {
      setIsPlayingSentence(false);
    });
  };

  return (
    <div className="w-full bg-slate-800/90 backdrop-blur border border-slate-700 rounded-2xl p-3 sm:p-4 shadow-xl select-none">
      {/* Top Header Label */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-700/80 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <span>英语课堂核心学习目标</span>
              <span className="text-[11px] font-normal px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                备课重点
              </span>
            </h2>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>点击小喇叭听真人发音，带小朋友大声跟读！</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* WORD CARD (Col 1-5) */}
        <div className="md:col-span-5 bg-gradient-to-br from-indigo-950/60 to-slate-900/90 rounded-xl p-3 border border-indigo-500/30 relative group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-amber-300 font-serif tracking-wide">
                marathon
              </span>
              <span className="text-xs text-indigo-300 font-mono bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800">
                {LEARNING_CONTENT.phonetic}
              </span>
            </div>

            <button
              onClick={handlePlayWord}
              disabled={isPlayingWord}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 ${
                isPlayingWord
                  ? 'bg-amber-400 text-amber-950 scale-105 ring-2 ring-amber-300'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
              title="播放单词发音"
            >
              <Volume2 className={`w-4 h-4 ${isPlayingWord ? 'animate-bounce' : ''}`} />
              <span>{isPlayingWord ? '朗读中...' : '读单词'}</span>
            </button>
          </div>

          <div className="mt-2 text-xs text-slate-300 flex items-center gap-2">
            <span className="font-semibold text-amber-400/90">词义:</span>
            <span>{LEARNING_CONTENT.wordTranslation}</span>
          </div>

          {/* Syllable Breakdown */}
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
            <span>音节切分:</span>
            <span className="font-mono text-indigo-200 font-bold bg-slate-950/60 px-1.5 py-0.5 rounded">
              ma · ra · thon
            </span>
          </div>
        </div>

        {/* SENTENCE CARD (Col 6-12) */}
        <div className="md:col-span-7 bg-gradient-to-br from-emerald-950/50 to-slate-900/90 rounded-xl p-3 border border-emerald-500/30 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex-1">
              <div className="text-xs text-emerald-400 font-semibold mb-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>重点句型 Key Sentence</span>
              </div>
              <p className="text-base sm:text-lg font-black text-white tracking-wide">
                <span className="text-amber-300 underline decoration-amber-400 decoration-2 underline-offset-4">
                  Marathon
                </span>{' '}
                is a long running race.
              </p>
            </div>

            <button
              onClick={handlePlaySentence}
              disabled={isPlayingSentence}
              className={`self-start sm:self-center flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 whitespace-nowrap ${
                isPlayingSentence
                  ? 'bg-emerald-400 text-emerald-950 scale-105 ring-2 ring-emerald-300'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
              title="播放整句发音"
            >
              <Volume2 className={`w-4 h-4 ${isPlayingSentence ? 'animate-bounce' : ''}`} />
              <span>{isPlayingSentence ? '朗读中...' : '读整句'}</span>
            </button>
          </div>

          <div className="mt-2 text-xs text-slate-300 flex items-center gap-2">
            <span className="font-semibold text-emerald-400">中文释义:</span>
            <span className="text-slate-200">{LEARNING_CONTENT.sentenceTranslation}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
