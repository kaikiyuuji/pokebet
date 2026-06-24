const SOUND_KEY = 'pokebet-sound-muted';

let audioContext = null;
let masterGain = null;
let musicGain = null;
let sfxGain = null;
let desiredTrack = 'ambient';
let activeTrack = null;
let schedulerTimer = null;
let nextStepTime = 0;
let stepIndex = 0;
let unlocked = false;
let muted = typeof window !== 'undefined'
    ? window.localStorage.getItem(SOUND_KEY) === 'true'
    : false;

const NOTE = {
    C3: 130.81,
    D3: 146.83,
    E3: 164.81,
    F3: 174.61,
    G3: 196.00,
    A3: 220.00,
    B3: 246.94,
    C4: 261.63,
    D4: 293.66,
    E4: 329.63,
    F4: 349.23,
    G4: 392.00,
    A4: 440.00,
    B4: 493.88,
    C5: 523.25,
    D5: 587.33,
    E5: 659.25,
    F5: 698.46,
    G5: 783.99,
    A5: 880.00,
    B5: 987.77,
    C6: 1046.50,
};

const TRACKS = {
    ambient: {
        bpm: 116,
        melody: [
            NOTE.E4, null, NOTE.G4, NOTE.B4, NOTE.A4, null, NOTE.G4, NOTE.E4,
            NOTE.D4, null, NOTE.G4, NOTE.A4, NOTE.B4, null, NOTE.G4, null,
        ],
        bass: [
            NOTE.E3, null, NOTE.E3, null, NOTE.C3, null, NOTE.C3, null,
            NOTE.D3, null, NOTE.D3, null, NOTE.B3, null, NOTE.B3, null,
        ],
    },
    battle: {
        bpm: 164,
        melody: [
            NOTE.E5, NOTE.E5, NOTE.G5, NOTE.B5, NOTE.A5, NOTE.G5, NOTE.E5, NOTE.D5,
            NOTE.E5, NOTE.G5, NOTE.A5, NOTE.C6, NOTE.B5, NOTE.A5, NOTE.G5, NOTE.D5,
        ],
        bass: [
            NOTE.E3, NOTE.E3, NOTE.G3, NOTE.E3, NOTE.C3, NOTE.C3, NOTE.D3, NOTE.D3,
            NOTE.E3, NOTE.E3, NOTE.G3, NOTE.A3, NOTE.B3, NOTE.A3, NOTE.G3, NOTE.D3,
        ],
    },
};

function getContext() {
    if (audioContext || typeof window === 'undefined') return audioContext;

    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return null;

    audioContext = new Context();
    masterGain = audioContext.createGain();
    musicGain = audioContext.createGain();
    sfxGain = audioContext.createGain();

    masterGain.gain.value = muted ? 0 : 1;
    musicGain.gain.value = 0.16;
    sfxGain.gain.value = 0.34;

    musicGain.connect(masterGain);
    sfxGain.connect(masterGain);
    masterGain.connect(audioContext.destination);

    return audioContext;
}

function scheduleTone({
    frequency,
    duration,
    delay = 0,
    type = 'square',
    volume = 0.2,
    destination = 'sfx',
    slideTo = null,
}) {
    const context = getContext();
    if (!context || !frequency) return;

    const output = destination === 'music' ? musicGain : sfxGain;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + delay;
    const end = start + duration;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    if (slideTo) oscillator.frequency.exponentialRampToValueAtTime(slideTo, end);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(volume, start + Math.min(0.01, duration / 4));
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    oscillator.connect(gain);
    gain.connect(output);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
}

function sequence(notes) {
    notes.forEach(([frequency, duration, delay, type = 'square', volume = 0.22, slideTo = null]) => {
        scheduleTone({ frequency, duration, delay, type, volume, slideTo });
    });
}

function scheduleMusicStep(trackName, time, index) {
    const track = TRACKS[trackName];
    if (!track) return;

    const melody = track.melody[index % track.melody.length];
    const bass = track.bass[index % track.bass.length];
    const delay = Math.max(0, time - audioContext.currentTime);
    const stepDuration = 60 / track.bpm / 2;

    if (melody) {
        scheduleTone({
            frequency: melody,
            duration: stepDuration * 0.72,
            delay,
            type: 'square',
            volume: trackName === 'battle' ? 0.12 : 0.09,
            destination: 'music',
        });
    }

    if (bass) {
        scheduleTone({
            frequency: bass,
            duration: stepDuration * 0.82,
            delay,
            type: trackName === 'battle' ? 'sawtooth' : 'triangle',
            volume: trackName === 'battle' ? 0.08 : 0.055,
            destination: 'music',
        });
    }
}

function runScheduler() {
    if (!audioContext || !activeTrack) return;

    const track = TRACKS[activeTrack];
    const stepDuration = 60 / track.bpm / 2;

    while (nextStepTime < audioContext.currentTime + 0.12) {
        scheduleMusicStep(activeTrack, nextStepTime, stepIndex);
        nextStepTime += stepDuration;
        stepIndex += 1;
    }
}

function beginTrack(trackName) {
    const context = getContext();
    desiredTrack = trackName;

    if (!context || !unlocked) return;
    if (activeTrack === trackName && schedulerTimer) return;

    window.clearInterval(schedulerTimer);
    activeTrack = trackName;
    stepIndex = 0;
    nextStepTime = context.currentTime + 0.04;
    runScheduler();
    schedulerTimer = window.setInterval(runScheduler, 40);
}

export async function unlockAudio() {
    const context = getContext();
    if (!context) return;

    if (context.state === 'suspended') {
        await context.resume();
    }

    unlocked = context.state === 'running';
    if (unlocked) beginTrack(desiredTrack);
}

export function setMusicTrack(trackName) {
    beginTrack(TRACKS[trackName] ? trackName : 'ambient');
}

export function setSoundMuted(nextMuted) {
    muted = nextMuted;
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(SOUND_KEY, String(muted));
    }

    const context = getContext();
    if (context && masterGain) {
        masterGain.gain.cancelScheduledValues(context.currentTime);
        masterGain.gain.setTargetAtTime(muted ? 0 : 1, context.currentTime, 0.025);
    }
}

export function getSoundMuted() {
    return muted;
}

export const sound = {
    click: () => sequence([
        [NOTE.C5, 0.035, 0, 'square', 0.1],
        [NOTE.E5, 0.045, 0.026, 'square', 0.08],
    ]),

    select: () => sequence([
        [NOTE.G5, 0.045, 0, 'square', 0.12],
        [NOTE.C6, 0.06, 0.04, 'square', 0.1],
    ]),

    confirm: () => sequence([
        [NOTE.C5, 0.055, 0, 'square', 0.14],
        [NOTE.E5, 0.055, 0.05, 'square', 0.13],
        [NOTE.G5, 0.09, 0.1, 'square', 0.13],
    ]),

    rouletteTick: (index = 0) => {
        const frequency = 920 - Math.min(index, 24) * 18;
        scheduleTone({
            frequency,
            duration: 0.028,
            type: 'square',
            volume: 0.13,
            slideTo: frequency * 0.72,
        });
    },

    rouletteReveal: () => sequence([
        [NOTE.G4, 0.07, 0, 'square', 0.14],
        [NOTE.C5, 0.07, 0.07, 'square', 0.16],
        [NOTE.E5, 0.12, 0.14, 'square', 0.18],
    ]),

    attack: () => sequence([
        [660, 0.08, 0, 'square', 0.18, 390],
        [440, 0.06, 0.07, 'square', 0.13],
    ]),

    hit: () => sequence([
        [220, 0.06, 0, 'sawtooth', 0.2, 120],
        [180, 0.1, 0.05, 'square', 0.13],
    ]),

    superEffective: () => sequence([
        [NOTE.C5, 0.07, 0, 'square', 0.19],
        [NOTE.E5, 0.07, 0.08, 'square', 0.2],
        [NOTE.G5, 0.12, 0.16, 'square', 0.22],
    ]),

    critical: () => sequence([
        [NOTE.A5, 0.05, 0, 'square', 0.18],
        [NOTE.C6, 0.05, 0.07, 'square', 0.2],
        [1319, 0.08, 0.14, 'square', 0.22],
    ]),

    victory: () => sequence([
        [NOTE.C5, 0.15, 0, 'square', 0.2],
        [NOTE.E5, 0.15, 0.18, 'square', 0.2],
        [NOTE.G5, 0.15, 0.36, 'square', 0.21],
        [NOTE.C6, 0.3, 0.54, 'square', 0.24],
    ]),

    defeat: () => sequence([
        [330, 0.2, 0, 'sawtooth', 0.18],
        [294, 0.2, 0.22, 'sawtooth', 0.16],
        [247, 0.25, 0.44, 'sawtooth', 0.14],
        [196, 0.4, 0.7, 'sawtooth', 0.12],
    ]),

    draw: () => sequence([
        [NOTE.A4, 0.12, 0, 'square', 0.15],
        [NOTE.A4, 0.12, 0.2, 'square', 0.12],
    ]),

    jackpot: () => sequence([
        [NOTE.C5, 0.08, 0, 'square', 0.2],
        [NOTE.E5, 0.08, 0.09, 'square', 0.2],
        [NOTE.G5, 0.08, 0.18, 'square', 0.21],
        [NOTE.C6, 0.08, 0.27, 'square', 0.23],
        [1319, 0.15, 0.36, 'square', 0.24],
        [NOTE.C6, 0.25, 0.52, 'square', 0.22],
    ]),
};
