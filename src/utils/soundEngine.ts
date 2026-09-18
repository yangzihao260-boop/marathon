/**
 * Comprehensive Web Audio synthesizer and Web Speech API engine
 * for Marathon English Game.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmInterval: number | null = null;
  private isBgmPlaying: boolean = false;
  private bgmStep: number = 0;
  private tempoBpm: number = 148;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.85;
      this.masterGain.connect(this.ctx.destination);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = 0.35;
      this.bgmGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.75;
      this.sfxGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.85, this.ctx.currentTime);
    }
    if (muted && this.isBgmPlaying) {
      this.pauseBGM();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Sound on every click - snappy athletic footstep/sprint sound
   */
  public playTapSound(clickIndex: number = 0) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;

      const now = this.ctx.currentTime;
      // Pitch slightly rises as runner progresses (0 to 30) for escalating excitement
      const progressFactor = Math.min(clickIndex / 30, 1);
      const baseFreq = 160 + progressFactor * 120 + ((clickIndex % 2 === 0) ? 20 : -15);

      // Footstep thump / punch
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.09);

      // White noise gravel/surface scuff
      const bufferSize = this.ctx.sampleRate * 0.04;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(800 + progressFactor * 400, now);
      noiseFilter.Q.setValueAtTime(2, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.sfxGain);

      noise.start(now);
      noise.stop(now + 0.05);
    } catch {
      // ignore audio errors
    }
  }

  /**
   * Countdown beep for 3, 2, 1 and starting gun / whistle
   */
  public playCountdownBeep(isGo: boolean = false) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (!isGo) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.22);
      } else {
        // High energetic referee whistle + gun
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1174, now + 0.1);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.35);

        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.42);
      }
    } catch {
      // ignore
    }
  }

  /**
   * Victory sound and crowd cheer
   */
  public playFinishSound(rank: number) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;

      const now = this.ctx.currentTime;
      // Celebratory brass arpeggio
      const notes = rank === 1 ? [523.25, 659.25, 783.99, 1046.5, 1318.5] : [440, 554.37, 659.25, 880];
      notes.forEach((freq, i) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);

        gain.gain.setValueAtTime(0, now + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.6, now + i * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.5);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.55);
      });
    } catch {
      // ignore
    }
  }

  /**
   * Tension-filled driving race BGM synthesizer (Procedural 148 BPM EDM/Rock style)
   */
  public startBGM(difficultyLevel: number = 1) {
    if (this.isMuted) return;
    this.initContext();
    if (this.isBgmPlaying) return;

    this.isBgmPlaying = true;
    this.bgmStep = 0;
    // Faster tempo for higher difficulty to heighten tension!
    this.tempoBpm = 135 + difficultyLevel * 8;
    const stepDurationMs = (60 / this.tempoBpm / 4) * 1000; // 16th note in ms

    const bassNotes = [110, 110, 110, 110, 130.81, 130.81, 98, 98]; // A, C, G
    const leadNotes = [440, 523.25, 659.25, 587.33, 783.99, 659.25, 523.25, 440];

    this.bgmInterval = window.setInterval(() => {
      if (!this.ctx || !this.bgmGain || this.isMuted) return;
      const now = this.ctx.currentTime;
      const step = this.bgmStep % 16;
      this.bgmStep++;

      // 1. Kick drum on 0, 4, 8, 12 (Four on the floor)
      if (step % 4 === 0) {
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(140, now);
        kickOsc.frequency.exponentialRampToValueAtTime(35, now + 0.12);

        kickGain.gain.setValueAtTime(0.8, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

        kickOsc.connect(kickGain);
        kickGain.connect(this.bgmGain);
        kickOsc.start(now);
        kickOsc.stop(now + 0.14);
      }

      // 2. Snare on step 4 and 12
      if (step === 4 || step === 12) {
        const snareNoise = this.ctx.createBufferSource();
        const bufferSize = this.ctx.sampleRate * 0.1;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.4;
        }
        snareNoise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1200, now);

        const snareGain = this.ctx.createGain();
        snareGain.gain.setValueAtTime(0.45, now);
        snareGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        snareNoise.connect(filter);
        filter.connect(snareGain);
        snareGain.connect(this.bgmGain);
        snareNoise.start(now);
        snareNoise.stop(now + 0.13);
      }

      // 3. Hi-hat on every odd 16th note
      if (step % 2 === 1) {
        const hat = this.ctx.createBufferSource();
        const bufferSize = this.ctx.sampleRate * 0.03;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.2;
        }
        hat.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(6000, now);

        const hatGain = this.ctx.createGain();
        hatGain.gain.setValueAtTime(0.18, now);
        hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        hat.connect(filter);
        filter.connect(hatGain);
        hatGain.connect(this.bgmGain);
        hat.start(now);
        hat.stop(now + 0.04);
      }

      // 4. Driving Bass Synth on 16th notes
      if (step % 2 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        const noteIndex = Math.floor(this.bgmStep / 8) % bassNotes.length;
        const freq = bassNotes[noteIndex];

        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(freq, now);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);

        bassGain.gain.setValueAtTime(0.28, now);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        bassOsc.connect(filter);
        filter.connect(bassGain);
        bassGain.connect(this.bgmGain);
        bassOsc.start(now);
        bassOsc.stop(now + 0.11);
      }

      // 5. Tension Melody Arpeggio
      if (step % 4 === 2) {
        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();
        const leadFreq = leadNotes[(this.bgmStep + 3) % leadNotes.length];

        leadOsc.type = 'sine';
        leadOsc.frequency.setValueAtTime(leadFreq, now);

        leadGain.gain.setValueAtTime(0.2, now);
        leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        leadOsc.connect(leadGain);
        leadGain.connect(this.bgmGain);
        leadOsc.start(now);
        leadOsc.stop(now + 0.16);
      }
    }, stepDurationMs);
  }

  public pauseBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.isBgmPlaying = false;
  }

  public stopBGM() {
    this.pauseBGM();
    this.bgmStep = 0;
  }

  /**
   * High quality speech synthesis for English teaching
   */
  public speakEnglish(text: string, onEnd?: () => void) {
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }
    try {
      window.speechSynthesis.cancel(); // Stop any pending speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.88; // Slightly deliberate for clear children's learning
      utterance.pitch = 1.05; // Friendly and engaging
      utterance.lang = 'en-US';

      // Pick high quality natural voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Alex'))
      ) || voices.find((v) => v.lang.startsWith('en'));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      if (onEnd) {
        utterance.onend = () => onEnd();
        utterance.onerror = () => onEnd();
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      if (onEnd) onEnd();
    }
  }
}

export const soundEngine = new SoundEngine();
