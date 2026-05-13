// SFX and menu BGM management.

const SoundManager = {
  storageKey: "memoryGameSoundMuted",
  bgmStorageKey: "memoryGameBGMMuted",
  muted: false,
  bgmMuted: false,
  audioContext: null,
  bgmNodes: null,
  bgmTargetVolume: 0.13,
  userInteracted: false,

  init() {
    try {
      this.muted = localStorage.getItem(this.storageKey) === "true";
      this.bgmMuted = localStorage.getItem(this.bgmStorageKey) === "true";
    } catch (error) {
      this.muted = false;
      this.bgmMuted = false;
    }

    this.updateToggle();
    this.updateBGMToggle();
    document.addEventListener("pointerdown", () => {
      this.userInteracted = true;
      this.unlock();
      this.updateBGMForPhase(GameState.phase);
    }, { once: true });
    document.addEventListener("click", (event) => {
      if (event.target.closest("button")) {
        this.play("button");
      }
    });
  },

  unlock() {
    if (this.audioContext) {
      if (this.audioContext.state === "suspended") {
        this.audioContext.resume().catch(() => {});
      }
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) {
        return;
      }

      this.audioContext = new AudioContextClass();
    } catch (error) {
      this.audioContext = null;
    }
  },

  isMuted() {
    return this.muted;
  },

  toggleMute() {
    this.muted = !this.muted;

    try {
      localStorage.setItem(this.storageKey, String(this.muted));
    } catch (error) {
      // localStorage may be unavailable in some embedded browsers.
    }

    this.updateToggle();

    if (!this.muted) {
      this.play("resume");
    }
  },

  toggleBGM() {
    this.bgmMuted = !this.bgmMuted;

    try {
      localStorage.setItem(this.bgmStorageKey, String(this.bgmMuted));
    } catch (error) {
      // localStorage may be unavailable in some embedded browsers.
    }

    this.updateBGMToggle();

    if (this.bgmMuted) {
      this.stopBGM();
      return;
    }

    this.userInteracted = true;
    this.unlock();
    this.updateBGMForPhase(GameState.phase);
  },

  updateToggle() {
    const button = document.getElementById("soundToggleButton");

    if (!button) {
      return;
    }

    button.textContent = this.muted ? "音效：关" : "音效：开";
    button.setAttribute("aria-pressed", String(!this.muted));
  },

  updateBGMToggle() {
    const button = document.getElementById("musicToggleButton");

    if (!button) {
      return;
    }

    button.textContent = this.bgmMuted ? "音乐：关" : "音乐：开";
    button.setAttribute("aria-pressed", String(!this.bgmMuted));
  },

  isBGMEnabled() {
    return !this.bgmMuted;
  },

  playSFX(type) {
    this.play(type);
  },

  updateBGMForPhase(phase = GameState.phase) {
    if (phase === "home" || phase === "gameOver") {
      this.startMenuBGM();
      return;
    }

    this.stopBGM();
  },

  startMenuBGM() {
    if (this.bgmMuted || this.bgmNodes || !this.userInteracted) {
      return;
    }

    try {
      this.unlock();

      if (!this.audioContext || this.audioContext.state === "suspended") {
        return;
      }

      const context = this.audioContext;
      const masterGain = context.createGain();
      const now = context.currentTime;

      masterGain.gain.setValueAtTime(0.0001, now);
      masterGain.gain.exponentialRampToValueAtTime(this.bgmTargetVolume, now + 1.1);

      masterGain.connect(context.destination);

      const arpTimerId = this.startMenuArpeggio(masterGain);
      const chordTimerId = this.startMenuChordStabs(masterGain);
      const counterMelodyTimerId = this.startMenuCounterMelody(masterGain);
      const beatTimerId = this.startMenuBeat(masterGain);
      const systemPulseTimerId = this.startMenuSystemPulse(masterGain);
      const anomalyTimerId = this.startMenuAnomalyAccent(masterGain);

      this.bgmNodes = {
        masterGain,
        sources: [],
        timers: [arpTimerId, chordTimerId, counterMelodyTimerId, beatTimerId, systemPulseTimerId, anomalyTimerId]
      };
    } catch (error) {
      this.bgmNodes = null;
    }
  },

  stopBGM() {
    if (!this.bgmNodes) {
      return;
    }

    const nodes = this.bgmNodes;
    this.bgmNodes = null;

    try {
      const context = this.audioContext;
      const stopTime = context ? context.currentTime + 0.35 : 0;

      if (context && nodes.masterGain) {
        nodes.masterGain.gain.cancelScheduledValues(context.currentTime);
        nodes.masterGain.gain.setValueAtTime(Math.max(nodes.masterGain.gain.value, 0.0001), context.currentTime);
        nodes.masterGain.gain.exponentialRampToValueAtTime(0.0001, stopTime);
      }

      nodes.sources.forEach((source) => {
        try {
          source.stop(stopTime + 0.02);
        } catch (error) {
          // Source may already be stopped.
        }
      });

      (nodes.timers || []).forEach((timerId) => clearInterval(timerId));

      setTimeout(() => {
        try {
          nodes.masterGain.disconnect();
        } catch (error) {
          // Disconnect failures are harmless for optional audio.
        }
      }, 450);
    } catch (error) {
      // BGM is optional. Stop failures must not affect the game.
    }
  },

  pauseBGM() {
    this.stopBGM();
  },

  resumeBGM() {
    this.updateBGMForPhase(GameState.phase);
  },

  startMenuArpeggio(destination) {
    const patterns = [
      [293.66, 369.99, 440, 587.33, 493.88, 440, 369.99, 329.63],
      [349.23, 440, 523.25, 659.25, 587.33, 523.25, 440, 392],
      [329.63, 392, 493.88, 659.25, 587.33, 493.88, 392, 369.99],
      [392, 493.88, 587.33, 739.99, 659.25, 587.33, 493.88, 440]
    ];
    let step = 0;
    const playStep = () => {
      if (!this.audioContext || !this.bgmNodes) {
        return;
      }

      const pattern = patterns[Math.floor(step / 8) % patterns.length];
      const frequency = pattern[step % pattern.length];
      const accent = step % 8 === 0 ? 0.12 : 0.085;

      this.playMenuBGMNote(destination, frequency, accent);
      step += 1;
    };

    playStep();

    return setInterval(playStep, 380);
  },

  playMenuBGMNote(destination, frequency, volume) {
    try {
      const context = this.audioContext;
      const oscillator = context.createOscillator();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      const now = context.currentTime;
      const endTime = now + 0.28;

      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(frequency, now);
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1600, now);
      filter.Q.setValueAtTime(0.7, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, endTime);
      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(destination);
      oscillator.start(now);
      oscillator.stop(endTime + 0.02);
    } catch (error) {
      // Menu BGM notes are optional and should never interrupt gameplay.
    }
  },

  startMenuChordStabs(destination) {
    const chords = [
      [146.83, 220, 293.66],
      [174.61, 261.63, 349.23],
      [164.81, 246.94, 329.63],
      [196, 293.66, 392]
    ];
    let step = 0;
    const playChord = () => {
      if (!this.audioContext || !this.bgmNodes) {
        return;
      }

      this.playMenuChord(destination, chords[step % chords.length], 0.05);
      step += 1;
    };

    playChord();

    return setInterval(playChord, 3040);
  },

  playMenuChord(destination, frequencies, volume) {
    frequencies.forEach((frequency, index) => {
      setTimeout(() => {
        this.playMenuBGMNote(destination, frequency, volume / frequencies.length);
      }, index * 18);
    });
  },

  startMenuCounterMelody(destination) {
    const notes = [880, 987.77, 739.99, 880, 659.25, 739.99];
    let step = 0;
    const playStep = () => {
      if (!this.audioContext || !this.bgmNodes) {
        return;
      }

      this.playMenuBGMNote(destination, notes[step % notes.length], 0.06);
      step += 1;
    };

    setTimeout(playStep, 760);

    return setInterval(playStep, 1520);
  },

  startMenuBeat(destination) {
    let step = 0;
    const playStep = () => {
      if (!this.audioContext || !this.bgmNodes) {
        return;
      }

      this.playMenuBeat(destination, step % 4 === 0 ? 0.075 : 0.044);
      step += 1;
    };

    playStep();

    return setInterval(playStep, 760);
  },

  playMenuBeat(destination, volume) {
    try {
      const context = this.audioContext;
      const oscillator = context.createOscillator();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      const now = context.currentTime;
      const endTime = now + 0.08;

      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(220, now);
      oscillator.frequency.exponentialRampToValueAtTime(110, now + 0.06);
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(820, now);
      filter.Q.setValueAtTime(0.6, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, endTime);
      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(destination);
      oscillator.start(now);
      oscillator.stop(endTime + 0.02);
    } catch (error) {
      // Optional menu beat. Playback failures must not affect the game.
    }
  },

  startMenuSystemPulse(destination) {
    const playPulse = () => {
      this.playMenuSystemPulse(destination);
    };

    setTimeout(playPulse, 700);

    return setInterval(playPulse, 8400);
  },

  startMenuAnomalyAccent(destination) {
    const playAccent = () => {
      this.playMenuAnomalyAccent(destination);
    };

    setTimeout(playAccent, 5200);

    return setInterval(playAccent, 12600);
  },

  playMenuAnomalyAccent(destination) {
    const blips = [
      { from: 1320, to: 1760, volume: 0.09 },
      { from: 2489, to: 1975, volume: 0.078 },
      { from: 932, to: 1397, volume: 0.068 }
    ];

    blips.forEach((blip, index) => {
      setTimeout(() => {
        this.playMenuAnomalyBlip(destination, blip);
      }, index * 86);
    });

    setTimeout(() => {
      this.playMenuSystemPulse(destination);
    }, 260);
  },

  playMenuAnomalyBlip(destination, { from, to, volume }) {
    try {
      if (!this.audioContext || !this.bgmNodes) {
        return;
      }

      const context = this.audioContext;
      const oscillator = context.createOscillator();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      const now = context.currentTime;
      const endTime = now + 0.095;

      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(from, now);
      oscillator.frequency.exponentialRampToValueAtTime(to, now + 0.07);
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1500, now);
      filter.Q.setValueAtTime(5.5, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, endTime);
      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(destination);
      oscillator.start(now);
      oscillator.stop(endTime + 0.02);
    } catch (error) {
      // Optional anomaly accent. Playback failures must not affect the game.
    }
  },

  playMenuSystemPulse(destination) {
    try {
      if (!this.audioContext || !this.bgmNodes) {
        return;
      }

      const context = this.audioContext;
      const oscillator = context.createOscillator();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      const now = context.currentTime;
      const endTime = now + 0.42;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(110, now);
      oscillator.frequency.exponentialRampToValueAtTime(146.83, now + 0.26);
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(520, now);
      filter.Q.setValueAtTime(0.55, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, endTime);
      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(destination);
      oscillator.start(now);
      oscillator.stop(endTime + 0.02);
    } catch (error) {
      // Optional menu accent. Playback failures must not affect the game.
    }
  },

  play(type) {
    if (this.muted) {
      return;
    }

    try {
      this.unlock();

      if (!this.audioContext || this.audioContext.state === "suspended") {
        return;
      }

      const patterns = {
        button: [{ frequency: 520, duration: 0.045, volume: 0.28 }],
        observeStart: [
          { frequency: 330, duration: 0.08, volume: 0.36 },
          { frequency: 520, duration: 0.1, delay: 0.06, volume: 0.32 }
        ],
        event: [{ frequency: 760, duration: 0.055, type: "triangle", volume: 0.22 }],
        doorChime: [
          { frequency: 660, duration: 0.08, type: "sine", volume: 0.28 },
          { frequency: 990, duration: 0.1, delay: 0.06, type: "triangle", volume: 0.22 }
        ],
        correct: [
          { frequency: 520, duration: 0.08, volume: 0.32 },
          { frequency: 780, duration: 0.12, delay: 0.07, volume: 0.28 }
        ],
        wrong: [
          { frequency: 240, duration: 0.12, type: "sawtooth", volume: 0.18 },
          { frequency: 170, duration: 0.16, delay: 0.08, type: "sawtooth", volume: 0.14 }
        ],
        lifeLost: [{ frequency: 120, duration: 0.18, type: "square", volume: 0.12 }],
        gameOver: [
          { frequency: 260, duration: 0.12, volume: 0.24 },
          { frequency: 190, duration: 0.16, delay: 0.11, volume: 0.2 },
          { frequency: 120, duration: 0.24, delay: 0.24, volume: 0.18 }
        ],
        pause: [{ frequency: 300, duration: 0.09, type: "triangle", volume: 0.24 }],
        resume: [{ frequency: 620, duration: 0.09, type: "triangle", volume: 0.24 }]
      };

      (patterns[type] || patterns.button).forEach((tone) => this.playTone(tone));
    } catch (error) {
      // Sound is optional. Playback failures must not affect the game.
    }
  },

  playTone({ frequency, duration, delay = 0, type = "sine", volume = 0.24 }) {
    const context = this.audioContext;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startTime = context.currentTime + delay;
    const endTime = startTime + duration;
    const safeVolume = Math.min(0.04, 0.04 * volume);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(safeVolume, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startTime);
    oscillator.stop(endTime + 0.02);
  }
};
