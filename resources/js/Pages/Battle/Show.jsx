import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatPokedexNumber, getTypeStyle } from '@/lib/pokemon';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

// ── Constants ──────────────────────────────────────────────────────────────────
const TURN_INTERVAL_MS   = 1600; // time per turn
const ANIM_ATTACK_MS     = 400;  // when attacker lunges
const ANIM_HIT_MS        = 700;  // when defender flashes
const HP_TRANSITION_MS   = 900;  // HP bar transition duration

// ── Helpers ───────────────────────────────────────────────────────────────────
function hpColor(pct) {
    if (pct > 0.5) return 'bg-green-500';
    if (pct > 0.2) return 'bg-yellow-400';
    return 'bg-red-500';
}

function effectivenessText(eff) {
    switch (eff) {
        case 'super-effective':
        case 'double-super-effective': return '¡É super efetivo!';
        case 'not-very-effective':      return 'Não é muito efetivo…';
        case 'immune':                  return 'Não afetou!';
        default:                        return null;
    }
}

// ── HP Bar ────────────────────────────────────────────────────────────────────
function HpBar({ current, max, label, level, side }) {
    const pct = max > 0 ? current / max : 0;
    const color = hpColor(pct);
    const isRight = side === 'opponent';

    return (
        <div className={`flex flex-col gap-1 ${isRight ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-baseline gap-2 ${isRight ? 'flex-row-reverse' : ''}`}>
                <span className="font-bold text-gray-800 text-sm">{label}</span>
                <span className="text-xs text-gray-500">Lv.{level}</span>
            </div>
            <div className="w-40 h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div
                    className={`h-full rounded-full ${color}`}
                    style={{
                        width: `${Math.max(0, pct * 100).toFixed(1)}%`,
                        transition: `width ${HP_TRANSITION_MS}ms ease-out`,
                    }}
                />
            </div>
            <span className="text-xs text-gray-500 font-mono">
                {Math.max(0, current)}/{max}
            </span>
        </div>
    );
}

// ── Pokémon Sprite ────────────────────────────────────────────────────────────
function PokemonSprite({ pokemon, side, animClass, fainted }) {
    const src = pokemon.sprite ?? pokemon.sprite_front ?? '/images/pokemon-placeholder.png';

    // Player side: mirror the sprite (like classic Pokémon games)
    const baseTransform = side === 'player' ? 'scaleX(-1)' : 'scaleX(1)';

    return (
        <div className="flex items-end justify-center" style={{ minHeight: '10rem' }}>
            <img
                key={animClass} // force re-mount to restart CSS animation
                src={src}
                alt={pokemon.name}
                className={`select-none object-contain drop-shadow-lg ${animClass} ${fainted ? 'battle-faint' : ''}`}
                style={{
                    width: '160px',
                    height: '160px',
                    transform: baseTransform,
                    imageRendering: 'pixelated',
                }}
                onError={(e) => { e.target.src = '/images/pokemon-placeholder.png'; }}
            />
        </div>
    );
}

// ── Turn Log ─────────────────────────────────────────────────────────────────
function TurnLog({ turns, currentIndex }) {
    const ref = useRef(null);
    const visible = turns.slice(0, currentIndex).slice(-5).reverse();

    useEffect(() => {
        ref.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentIndex]);

    return (
        <div ref={ref} className="bg-gray-900 text-green-400 font-mono text-xs rounded-xl p-3 h-28 overflow-hidden flex flex-col gap-1">
            {visible.length === 0 && (
                <span className="text-gray-500">Aguardando batalha…</span>
            )}
            {visible.map((t, i) => (
                <LogLine key={currentIndex - i} turn={t} dimmed={i > 0} />
            ))}
        </div>
    );
}

function LogLine({ turn, dimmed }) {
    const attacker = turn.attacker === 'player' ? '🗡️ Seu' : '👾 Oponente';
    const effText  = effectivenessText(turn.effectiveness);

    return (
        <div className={`transition-opacity ${dimmed ? 'opacity-40' : 'opacity-100'}`}>
            <span className="text-gray-400">{attacker} </span>
            <span className="text-white font-semibold">usou {turn.move_name}</span>
            {turn.damage_dealt > 0 && (
                <span className="text-green-400"> → {turn.damage_dealt} dano</span>
            )}
            {turn.is_critical && (
                <span className="text-yellow-400"> ★ Crítico!</span>
            )}
            {effText && (
                <span className="text-pink-400"> {effText}</span>
            )}
        </div>
    );
}

// ── Result Overlay ────────────────────────────────────────────────────────────
function ResultOverlay({ result, coins, onReplay }) {
    const config = {
        win:  { emoji: '🏆', title: 'Vitória!',  bg: 'from-yellow-400 to-amber-500', text: 'text-amber-900' },
        loss: { emoji: '💀', title: 'Derrota…',  bg: 'from-gray-700 to-gray-900',   text: 'text-gray-100' },
        draw: { emoji: '🤝', title: 'Empate!',   bg: 'from-blue-500 to-indigo-600', text: 'text-white' },
    }[result] ?? { emoji: '?', title: result, bg: 'from-gray-500 to-gray-700', text: 'text-white' };

    return (
        <div className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br ${config.bg} rounded-2xl z-10`}>
            <div className="text-6xl mb-2">{config.emoji}</div>
            <h2 className={`text-3xl font-black ${config.text}`}>{config.title}</h2>
            <p className={`mt-1 text-sm ${config.text} opacity-80`}>
                +{coins} <span className="opacity-70">moedas ganhas</span>
            </p>
            <div className="mt-6 flex gap-3">
                <Link
                    href={route('battle.new')}
                    className="rounded-lg bg-white/20 border border-white/30 px-5 py-2 text-sm font-semibold text-white hover:bg-white/30 transition-colors"
                >
                    Nova Batalha
                </Link>
                <button
                    onClick={onReplay}
                    className="rounded-lg bg-white/20 border border-white/30 px-5 py-2 text-sm font-semibold text-white hover:bg-white/30 transition-colors"
                >
                    ▶ Rever
                </button>
            </div>
        </div>
    );
}

// ── Main Battle Arena ─────────────────────────────────────────────────────────
export default function Show({ battle }) {
    const { player, opponent, turns, result, coins_awarded } = battle;

    const [phase, setPhase] = useState('ready'); // ready | playing | finished
    const [turnIdx, setTurnIdx] = useState(0);

    // Displayed HP (drives the HP bars)
    const [playerHp, setPlayerHp]     = useState(player.max_hp);
    const [opponentHp, setOpponentHp] = useState(opponent.max_hp);

    // Animation classes (reset each turn to restart CSS animations)
    const [playerAnim, setPlayerAnim]     = useState('');
    const [opponentAnim, setOpponentAnim] = useState('');

    // Fainted state
    const [playerFainted, setPlayerFainted]     = useState(false);
    const [opponentFainted, setOpponentFainted] = useState(false);

    // Timer ref for cleanup
    const timers = useRef([]);
    const clearAllTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
    const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.current.push(t); };

    useEffect(() => () => clearAllTimers(), []);

    // Advance one turn per TURN_INTERVAL_MS when playing
    useEffect(() => {
        if (phase !== 'playing') return;
        if (turnIdx >= turns.length) {
            later(() => setPhase('finished'), 600);
            return;
        }

        const turn = turns[turnIdx];
        const attackerIsPlayer = turn.attacker === 'player';

        // 1. Show attacker lunging
        later(() => {
            setPlayerAnim(attackerIsPlayer ? 'battle-lunge-right' : '');
            setOpponentAnim(!attackerIsPlayer ? 'battle-lunge-left' : '');
        }, ANIM_ATTACK_MS);

        // 2. Show defender being hit + update HP
        later(() => {
            setPlayerAnim(!attackerIsPlayer && turn.damage_dealt > 0 ? 'battle-hit' : '');
            setOpponentAnim(attackerIsPlayer && turn.damage_dealt > 0 ? 'battle-hit' : '');

            setPlayerHp(turn.player_hp_remaining);
            setOpponentHp(turn.opponent_hp_remaining);

            if (turn.player_hp_remaining <= 0) setPlayerFainted(true);
            if (turn.opponent_hp_remaining <= 0) setOpponentFainted(true);
        }, ANIM_HIT_MS);

        // 3. Advance to next turn
        later(() => {
            setTurnIdx((i) => i + 1);
        }, TURN_INTERVAL_MS);
    }, [phase, turnIdx]);

    const startBattle = () => {
        clearAllTimers();
        setPhase('playing');
        setTurnIdx(0);
        setPlayerHp(player.max_hp);
        setOpponentHp(opponent.max_hp);
        setPlayerFainted(false);
        setOpponentFainted(false);
        setPlayerAnim('');
        setOpponentAnim('');
    };

    const replay = () => startBattle();

    const finished = phase === 'finished';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <Link href={route('battle.new')} className="text-sm text-gray-400 hover:text-gray-600">
                        ← Batalha
                    </Link>
                    <span className="text-gray-300">/</span>
                    <h2 className="text-xl font-semibold text-gray-800">Batalha #{battle.id}</h2>
                </div>
            }
        >
            <Head title={`Batalha #${battle.id}`} />

            <div className="py-6">
                <div className="mx-auto max-w-lg px-4">
                    {/* Arena */}
                    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-700 to-slate-900 shadow-2xl p-5">

                        {/* Opponent area (top) */}
                        <div className="flex justify-between items-start mb-2">
                            <HpBar
                                current={opponentHp}
                                max={opponent.max_hp}
                                label={opponent.pokemon.name}
                                level={opponent.level}
                                side="opponent"
                            />
                            <span className="text-xs text-slate-500 font-mono">
                                {formatPokedexNumber(opponent.pokemon.pokeapi_id)}
                            </span>
                        </div>

                        {/* Sprites row */}
                        <div className="flex justify-between items-end px-2 py-4">
                            {/* Player (left, mirrored) */}
                            <PokemonSprite
                                pokemon={player.pokemon}
                                side="player"
                                animClass={playerAnim}
                                fainted={playerFainted}
                            />

                            {/* VS or progress */}
                            <div className="flex flex-col items-center gap-1">
                                {phase === 'ready' && (
                                    <span className="text-2xl font-black text-slate-500">VS</span>
                                )}
                                {phase === 'playing' && (
                                    <span className="text-xs text-slate-400 font-mono">
                                        {turnIdx}/{turns.length}
                                    </span>
                                )}
                            </div>

                            {/* Opponent (right) */}
                            <PokemonSprite
                                pokemon={opponent.pokemon}
                                side="opponent"
                                animClass={opponentAnim}
                                fainted={opponentFainted}
                            />
                        </div>

                        {/* Player HP (bottom) */}
                        <div className="flex justify-end mt-2">
                            <HpBar
                                current={playerHp}
                                max={player.max_hp}
                                label={player.pokemon.name}
                                level={player.level}
                                side="player"
                            />
                        </div>

                        {/* Result overlay */}
                        {finished && (
                            <ResultOverlay
                                result={result}
                                coins={coins_awarded}
                                onReplay={replay}
                            />
                        )}
                    </div>

                    {/* Turn log */}
                    <div className="mt-3">
                        <TurnLog turns={turns} currentIndex={turnIdx} />
                    </div>

                    {/* Controls */}
                    <div className="mt-3 flex justify-center gap-3">
                        {phase === 'ready' && (
                            <button
                                onClick={startBattle}
                                className="rounded-xl bg-indigo-600 px-8 py-3 text-base font-bold text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
                            >
                                ▶ Ver Batalha
                            </button>
                        )}
                        {phase === 'playing' && (
                            <button
                                onClick={() => { clearAllTimers(); setPhase('finished'); }}
                                className="rounded-xl border border-slate-200 px-5 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                                ⏩ Pular
                            </button>
                        )}
                        {phase !== 'ready' && (
                            <Link
                                href={route('battle.new')}
                                className="rounded-xl border border-slate-200 px-5 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                                ← Nova Batalha
                            </Link>
                        )}
                    </div>

                    {/* Type badges */}
                    <div className="mt-5 flex justify-between text-xs text-slate-500">
                        <MatchupTypes pokemon={player.pokemon} label="Seu time" />
                        <MatchupTypes pokemon={opponent.pokemon} label="Inimigo" align="right" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function MatchupTypes({ pokemon, label, align = 'left' }) {
    const types = [pokemon.primary_type, pokemon.secondary_type].filter(Boolean);
    return (
        <div className={`flex flex-col gap-1 ${align === 'right' ? 'items-end' : 'items-start'}`}>
            <span className="text-gray-400">{label}</span>
            <div className="flex gap-1">
                {types.map((t) => {
                    const { bg, text } = getTypeStyle(t.slug);
                    return (
                        <span key={t.slug} className={`${bg} ${text} px-2 py-0.5 rounded-full text-[10px] font-bold uppercase`}>
                            {t.name}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}
