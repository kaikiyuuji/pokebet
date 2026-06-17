let _ctx = null;

function getCtx() {
    if (!_ctx && typeof AudioContext !== 'undefined') {
        _ctx = new AudioContext();
    } else if (!_ctx && typeof webkitAudioContext !== 'undefined') {
        _ctx = new webkitAudioContext();
    }
    return _ctx;
}

function tone(freq, dur, type = 'square', vol = 0.25, delay = 0) {
    const ac = getCtx();
    if (!ac) return;

    if (ac.state === 'suspended') ac.resume();

    const osc  = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);

    osc.type = type;
    osc.frequency.value = freq;

    const t0 = ac.currentTime + delay;
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);

    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
}

function seq(notes) {
    notes.forEach(([freq, dur, delay, type = 'square', vol = 0.25]) =>
        tone(freq, dur, type, vol, delay)
    );
}

export const sound = {
    attack: () => seq([
        [660, 0.08, 0,    'square',   0.2 ],
        [440, 0.06, 0.07, 'square',   0.15],
    ]),

    hit: () => seq([
        [220, 0.06, 0,    'sawtooth', 0.28],
        [180, 0.10, 0.05, 'square',   0.18],
    ]),

    superEffective: () => seq([
        [523, 0.07, 0,    'square', 0.3 ],
        [659, 0.07, 0.08, 'square', 0.32],
        [784, 0.12, 0.16, 'square', 0.38],
    ]),

    critical: () => seq([
        [880,  0.05, 0,    'square', 0.28],
        [1047, 0.05, 0.07, 'square', 0.28],
        [1319, 0.08, 0.14, 'square', 0.32],
    ]),

    victory: () => seq([
        [523,  0.15, 0,    'square', 0.3 ],
        [659,  0.15, 0.18, 'square', 0.3 ],
        [784,  0.15, 0.36, 'square', 0.3 ],
        [1047, 0.30, 0.54, 'square', 0.35],
    ]),

    defeat: () => seq([
        [330, 0.20, 0,    'sawtooth', 0.28],
        [294, 0.20, 0.22, 'sawtooth', 0.24],
        [247, 0.25, 0.44, 'sawtooth', 0.20],
        [196, 0.40, 0.70, 'sawtooth', 0.16],
    ]),

    draw: () => seq([
        [440, 0.12, 0,    'square', 0.22],
        [440, 0.12, 0.20, 'square', 0.18],
    ]),

    select: () => tone(660, 0.06, 'square', 0.15),

    jackpot: () => seq([
        [523,  0.08, 0,    'square', 0.3 ],
        [659,  0.08, 0.09, 'square', 0.3 ],
        [784,  0.08, 0.18, 'square', 0.3 ],
        [1047, 0.08, 0.27, 'square', 0.35],
        [1319, 0.15, 0.36, 'square', 0.4 ],
        [1047, 0.25, 0.52, 'square', 0.38],
    ]),
};
