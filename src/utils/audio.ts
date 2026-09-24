/**
 * Procedural Web Audio API sound synthesizer for casual puzzle game.
 * Zero external audio files required, instant playback, zero lag.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isSoundEnabled = true;
  private isMusicEnabled = false;
  private soundVolume = 0.8;
  private musicVolume = 0.3;
  private musicInterval: number | null = null;
  private musicStep = 0;

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.isSoundEnabled = enabled;
  }

  public setMusicEnabled(enabled: boolean) {
    this.isMusicEnabled = enabled;
    if (enabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
  }

  public setVolumes(soundVol: number, musicVol: number) {
    this.soundVolume = Math.max(0, Math.min(1, soundVol));
    this.musicVolume = Math.max(0, Math.min(1, musicVol));
  }

  // Play button click / UI tap
  public playClick() {
    if (!this.isSoundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

      gain.gain.setValueAtTime(0.25 * this.soundVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // ignore
    }
  }

  // Keypad number tap: soft sweet bell tone based on key number
  public playKeypadTap(num: number | string) {
    if (!this.isSoundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      // Map digits to pleasant pentatonic scale
      const digit = typeof num === 'number' ? num : parseInt(num, 10) || 5;
      const baseFreqs = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.5, 1174.66, 1318.51];
      const freq = baseFreqs[digit % baseFreqs.length] || 659.25;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2 * this.soundVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // ignore
    }
  }

  // Backspace key tap
  public playBackspace() {
    if (!this.isSoundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.07);

      gain.gain.setValueAtTime(0.2 * this.soundVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // ignore
    }
  }

  // Correct answer: joyful ascending arpeggio
  public playCorrect() {
    if (!this.isSoundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;

      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noteTime = now + i * 0.09;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.3 * this.soundVolume, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.25);
      });
    } catch {
      // ignore
    }
  }

  // Wrong answer: friendly gentle double-thud
  public playWrong() {
    if (!this.isSoundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const notes = [260, 220];
      const now = this.ctx.currentTime;

      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noteTime = now + i * 0.12;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.2 * this.soundVolume, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.18);
      });
    } catch {
      // ignore
    }
  }

  // Level Complete fanfare
  public playLevelComplete() {
    if (!this.isSoundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const chords = [
        { freqs: [523.25, 659.25, 783.99], time: 0 },       // C Maj
        { freqs: [587.33, 739.99, 880.00], time: 0.15 },    // D Maj
        { freqs: [659.25, 830.61, 987.77], time: 0.3 },     // E Maj
        { freqs: [783.99, 987.77, 1174.66, 1567.98], time: 0.45 }, // G Maj peak
      ];
      const now = this.ctx.currentTime;

      chords.forEach((chord) => {
        chord.freqs.forEach((freq) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const t = now + chord.time;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0.18 * this.soundVolume, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(t);
          osc.stop(t + 0.4);
        });
      });
    } catch {
      // ignore
    }
  }

  // Coin sparkle sound
  public playCoin() {
    if (!this.isSoundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [987.77, 1318.51].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = now + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.25 * this.soundVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.2);
      });
    } catch {
      // ignore
    }
  }

  // Hint unlock sound (magical harp)
  public playHint() {
    if (!this.isSoundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const notes = [440, 554.37, 659.25, 880];
      const now = this.ctx.currentTime;
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = now + i * 0.06;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.2 * this.soundVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.25);
      });
    } catch {
      // ignore
    }
  }

  // Speed Math rapid tick/blip sound for countdown
  public playTick(isUrgent = false) {
    if (!this.isSoundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = isUrgent ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(isUrgent ? 880 : 440, now);
      gain.gain.setValueAtTime((isUrgent ? 0.2 : 0.12) * this.soundVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // ignore
    }
  }

  // Speed Math combo chime that steps up with combo multiplier
  public playCombo(comboCount: number) {
    if (!this.isSoundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const baseFreq = 520;
      const step = Math.min(comboCount, 10);
      const freq = baseFreq * Math.pow(1.08, step);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.25, now + 0.12);
      gain.gain.setValueAtTime(0.35 * this.soundVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      // ignore
    }
  }

  // Helper aliases for multi-screen and endless mode integration
  public playMilestone() {
    this.playLevelComplete();
  }

  public playSuccess() {
    this.playCorrect();
  }

  public playKey(val?: string | number) {
    this.playKeypadTap(val !== undefined ? val : 5);
  }

  public playWhoosh() {
    this.playClick();
  }

  // Gentle ambient casual game background soundtrack
  private startMusic() {
    this.stopMusic();
    if (!this.isMusicEnabled) return;
    this.initCtx();

    // Pentatonic calming kalimba melody
    const notes = [
      261.63, 329.63, 392.00, 523.25,
      329.63, 392.00, 523.25, 659.25,
      392.00, 523.25, 659.25, 783.99,
      329.63, 261.63, 392.00, 329.63
    ];

    this.musicInterval = window.setInterval(() => {
      if (!this.isMusicEnabled || !this.ctx) return;
      try {
        const freq = notes[this.musicStep % notes.length];
        this.musicStep++;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.04 * this.musicVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.4);
      } catch {
        // ignore
      }
    }, 450);
  }

  private stopMusic() {
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundManager = new SoundEngine();
