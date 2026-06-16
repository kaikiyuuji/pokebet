import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatPokedexNumber, getTypeStyle } from '@/lib/pokemon';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

// ── Timing constants ───────────────────────────────────────────────────────────
const TURN_MS    = 1500;
const ATTACK_MS  = 350;
const HIT_MS     = 650;

// ── Helpers ───────────────────────────────────────────────────────────────────
function hpColor(pct) {
    if (pct > 0.5) return 'bg-green-400';
    if (pct > 0.2) return 'bg-yellow-400';
    return 'bg-red-500';
}

function effectivenessLabel(eff) {
    switch (eff) {
        case 'super-effective':
        case 'double-super-effective': return { text: 'Super efetivo!', cls: 'text-pink-400' };
        case 'not-very-effective':      return { text: 'Fraco…',         cls: 'text-blue-400' };
        case 'immune':                  return { text: 'Sem efeito!',    cls: 'text-gray-400' };
        default:                        return null;
    }
}

// ── HP Bar ────────────────────────────────────────────────────────────────────
function HpBar({ current, max, name, level, side }) {
    const pct = max > 0 ? Math.max(0, current) / max : 0;
    const isRight = side === 'opponent';

    return (
        <div className={`flex flex-col gap-0.5 ${isRight ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-baseline gap-1.5 ${isRight ? 'flex-row-reverse' : ''}`}>
                <span className="text-sm font-bold text-white drop-shadow">{name}</span>
                <span className="text-xs text-slate-400">Lv.{level}</span>
            </div>
            <div className="w-36 h-2.5 rounded-full bg-slate-700 overflow-hidden shadow-inner">
                <div
                    className={`h-full rounded-full ${hpColor(pct)}`}
                    style={{ width: `${(pct * 100).toFixed(1)}%`, transition: 'width 900ms ease-out' }}
                />
            </div>
            <span className="text-xs text-slate-500 font-mono">
                {Math.max(0, current)}/{max}
            </span>
        </div>
    );
}

// ── Pokémon Sprite ─────────────────────────────────────────────────────────────
function PokemonSprite({ pokemon, side, animClass, fainted }) {
    const src = pokemon.sprite ?? '/images/pokemon-placeholder.png';
    const mirrored = side === 'player' ? 'scaleX(-1)' : 'scaleX(1)';

    return (
        <div className="flex items-end justify-center" style={{ minHeight: '9rem' }}>
            <img
                key={animClass}
                src={src}
                alt={pokemon.name}
                loading="eager"
                className={`object-contain drop-shadow-lg select-none ${animClass} ${fainted ? 'battle-faint' : ''}`}
                style={{ width: 148, height: 148, transform: mirrored, imageRendering: 'pixelated' }}
                onError={(e) => { e.currentTarget.src = '/images/pokemon-placeholder.png'; }}
            />
        </div>
    );
}

// ── Live log (during animation) ────────────────────────────────────────────────
function LiveLog({ turns, currentIdx }) {
    const visible = [...turns].slice(0, currentIdx).reverse().slice(0, 4);

    return (
        <div className="bg-slate-900 rounded-xl p-3 h-24 font-mono text-xs overflow-hidden flex flex-col gap-1">
            {visible.length === 0 && <span className="text-slate-600">Aguardando…</span>}
            {visible.map((t, i) => {
                const eff = effectivenessLabel(t.effectiveness);
                return (
                    <div key={currentIdx - i} className={i > 0 ? 'opacity-40' : ''}>
                        <span className="text-slate-400">
                            {t.attacker === 'player' ? '🗡️' : '👾'}
                        </span>{' '}
                        <span className="text-white">{t.move_name}</span>
                        {t.damage_dealt > 0 && <span className="text-green-400"> −{t.damage_dealt}</span>}
                        {t.is_critical && <span className="text-yellow-300"> ★</span>}
                        {eff && <span className={eff.cls}> {eff.text}</span>}
                    </div>
                );
            })}
        </div>
    );
}

// ── Arena ──────────────────────────────────────────────────────────────────────
function Arena({ player, opponent, playerHp, opponentHp, playerAnim, opponentAnim, playerFainted, opponentFainted, phase, turnIdx, totalTurns }) {
    return (
        <div className="rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 p-5 shadow-2xl">
            {/* Opponent row */}
            <div className="flex justify-between items-start mb-1">
                <HpBar current={opponentHp} max={opponent.max_hp} name={opponent.pokemon.name} level={opponent.level} side="opponent" />
                <span className="text-xs text-slate-600 font-mono">{formatPokedexNumber(opponent.pokemon.pokeapi_id)}</span>
            </div>

            {/* Sprites */}
            <div className="flex items-end justify-between gap-4 py-3 px-2">
                <PokemonSprite pokemon={player.pokemon} side="player" animClass={playerAnim} fainted={playerFainted} />

                <div className="flex flex-col items-center gap-1 shrink-0">
                    {phase === 'ready' && <span className="text-xl font-black text-slate-600">VS</span>}
                    {phase === 'playing' && (
                        <span className="text-xs text-slate-500 font-mono tabular-nums">
                            {turnIdx}/{totalTurns}
                        </span>
                    )}
                    {phase === 'finished' && <span className="text-lg text-slate-600">·</span>}
                </div>

                <PokemonSprite pokemon={opponent.pokemon} side="opponent" animClass={opponentAnim} fainted={opponentFainted} />
            </div>

            {/* Player row */}
            <div className="flex justify-end mt-1">
                <HpBar current={playerHp} max={player.max_hp} name={player.pokemon.name} level={player.level} side="player" />
            </div>
        </div>
    );
}

// ── Result panel ───────────────────────────────────────────────────────────────
function ResultPanel({ battle, stats }) {
    const [logOpen, setLogOpen] = useState(false);
    const { result, coins_awarded, player, opponent, turns } = battle;

    const cfg = {
        win:  { emoji: '🏆', label: 'Vitória!',  banner: 'from-yellow-400 to-amber-500',  text: 'text-amber-900' },
        loss: { emoji: '💀', label: 'Derrota…',  banner: 'from-gray-800 to-slate-900',    text: 'text-slate-200' },
        draw: { emoji: '🤝', label: 'Empate!',   banner: 'from-indigo-600 to-purple-700', text: 'text-white' },
    }[result] ?? { emoji: '?', label: result, banner: 'from-gray-600 to-gray-700', text: 'text-white' };

    return (
        <div className="mt-4 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            {/* Banner */}
            <div className={`bg-gradient-to-r ${cfg.banner} px-6 py-5 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                    <span className="text-4xl">{cfg.emoji}</span>
                    <h2 className={`text-2xl font-black ${cfg.text}`}>{cfg.label}</h2>
                </div>
                <div className={`flex flex-col items-end ${cfg.text}`}>
                    <span className="text-xs opacity-70">moedas ganhas</span>
                    <span className="text-2xl font-black">🪙 +{coins_awarded}</span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 text-center py-4">
                <StatCell label="Turnos" value={stats.totalTurns} />
                <StatCell label="Dano causado" value={stats.playerDamageDealt} highlight="text-green-600" />
                <StatCell label="Dano recebido" value={stats.opponentDamageDealt} highlight="text-red-500" />
            </div>

            {/* Best moves */}
            {(stats.playerBestMove || stats.opponentBestMove) && (
                <div className="grid grid-cols-2 gap-px bg-gray-100">
                    <BestMoveCell move={stats.playerBestMove} label="Seu melhor golpe" side="player" />
                    <BestMoveCell move={stats.opponentBestMove} label="Golpe inimigo" side="opponent" />
                </div>
            )}

            {/* Battle log toggle */}
            <div className="border-t border-gray-100">
                <button
                    onClick={() => setLogOpen(v => !v)}
                    className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    <span>📋 Log da batalha <span className="font-normal text-gray-400">({turns.length} turnos)</span></span>
                    <span className="text-gray-400">{logOpen ? '▲' : '▼'}</span>
                </button>

                {logOpen && <BattleLogTable turns={turns} player={player} opponent={opponent} />}
            </div>

            {/* Actions */}
            <div className="border-t border-gray-100 px-5 py-4 flex flex-wrap gap-3 justify-center">
                <Link
                    href={route('battle.new')}
                    className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 shadow transition-colors"
                >
                    ⚔️ Nova Batalha
                </Link>
                <Link
                    href={route('battles.log', battle.id)}
                    className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    📋 Log completo
                </Link>
                <Link
                    href={route('battles.index')}
                    className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    📜 Histórico
                </Link>
            </div>
        </div>
    );
}

function StatCell({ label, value, highlight = 'text-gray-800' }) {
    return (
        <div className="py-2 px-3">
            <div className={`text-xl font-bold ${highlight}`}>{value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{label}</div>
        </div>
    );
}

function BestMoveCell({ move, label, side }) {
    if (!move) return <div className="bg-white p-3" />;
    const typeStyle = move.move_type ? getTypeStyle(move.move_type) : null;

    return (
        <div className="bg-white p-3">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <div className="flex items-center gap-1.5 flex-wrap">
                {typeStyle && (
                    <span className={`${typeStyle.bg} ${typeStyle.text} text-[10px] px-1.5 py-0.5 rounded font-bold uppercase`}>
                        {move.move_type}
                    </span>
                )}
                <span className="text-sm font-semibold text-gray-800">{move.move_name}</span>
                <span className="text-sm text-gray-500">−{move.damage_dealt}</span>
            </div>
        </div>
    );
}

// ── Battle Log Table ──────────────────────────────────────────────────────────
function BattleLogTable({ turns, player, opponent }) {
    return (
        <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                        <th className="px-3 py-2 font-medium">#</th>
                        <th className="px-3 py-2 font-medium">Atacante</th>
                        <th className="px-3 py-2 font-medium">Golpe</th>
                        <th className="px-3 py-2 font-medium text-right">Dano</th>
                        <th className="px-3 py-2 font-medium">Efetividade</th>
                        <th className="px-3 py-2 font-medium text-right">HP 🗡️</th>
                        <th className="px-3 py-2 font-medium text-right">HP 👾</th>
                    </tr>
                </thead>
                <tbody>
                    {turns.map((t) => {
                        const eff = effectivenessLabel(t.effectiveness);
                        const isPlayer = t.attacker === 'player';
                        const typeStyle = t.move_type ? getTypeStyle(t.move_type) : null;

                        return (
                            <tr
                                key={t.turn_number}
                                className={`border-b border-gray-50 transition-colors ${
                                    isPlayer ? 'hover:bg-indigo-50' : 'hover:bg-red-50'
                                }`}
                            >
                                <td className="px-3 py-1.5 text-gray-400 font-mono">{t.turn_number}</td>
                                <td className="px-3 py-1.5">
                                    <span className={`inline-flex items-center gap-1 font-medium ${
                                        isPlayer ? 'text-indigo-600' : 'text-red-500'
                                    }`}>
                                        {isPlayer ? '🗡️' : '👾'}
                                        <span className="hidden sm:inline">
                                            {isPlayer ? player.pokemon.name : opponent.pokemon.name}
                                        </span>
                                    </span>
                                </td>
                                <td className="px-3 py-1.5">
                                    <div className="flex items-center gap-1.5">
                                        {typeStyle && (
                                            <span className={`${typeStyle.bg} ${typeStyle.text} text-[9px] px-1 py-0.5 rounded font-bold uppercase shrink-0`}>
                                                {t.move_type}
                                            </span>
                                        )}
                                        <span className="text-gray-800">
                                            {t.move_name}
                                            {t.stab && <span className="text-xs text-slate-400 ml-1">STAB</span>}
                                            {t.is_critical && <span className="text-yellow-500 ml-1">★</span>}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-3 py-1.5 text-right font-mono font-semibold text-gray-700">
                                    {t.damage_dealt > 0 ? `−${t.damage_dealt}` : <span className="text-gray-300">—</span>}
                                </td>
                                <td className="px-3 py-1.5">
                                    {eff
                                        ? <span className={`font-medium ${eff.cls}`}>{eff.text}</span>
                                        : <span className="text-gray-300">—</span>
                                    }
                                </td>
                                <td className={`px-3 py-1.5 text-right font-mono tabular-nums ${t.player_hp_remaining <= 0 ? 'text-red-500 font-bold' : 'text-gray-600'}`}>
                                    {Math.max(0, t.player_hp_remaining)}
                                </td>
                                <td className={`px-3 py-1.5 text-right font-mono tabular-nums ${t.opponent_hp_remaining <= 0 ? 'text-red-500 font-bold' : 'text-gray-600'}`}>
                                    {Math.max(0, t.opponent_hp_remaining)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function Show({ battle }) {
    const { player, opponent, turns, result, coins_awarded } = battle;

    const [phase, setPhase]             = useState('ready');
    const [turnIdx, setTurnIdx]         = useState(0);
    const [playerHp, setPlayerHp]       = useState(player.max_hp);
    const [opponentHp, setOpponentHp]   = useState(opponent.max_hp);
    const [playerAnim, setPlayerAnim]   = useState('');
    const [opponentAnim, setOpponentAnim] = useState('');
    const [playerFainted, setPlayerFainted]     = useState(false);
    const [opponentFainted, setOpponentFainted] = useState(false);

    const timers = useRef([]);
    const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.current.push(t); };
    const clearAll = () => { timers.current.forEach(clearTimeout); timers.current = []; };
    useEffect(() => () => clearAll(), []);

    // Battle stats (computed once from turns)
    const stats = useMemo(() => {
        const p = turns.filter(t => t.attacker === 'player');
        const o = turns.filter(t => t.attacker === 'opponent');
        const best = (arr) => arr.reduce((b, t) => t.damage_dealt > (b?.damage_dealt ?? 0) ? t : b, null);
        return {
            totalTurns:          turns.length,
            playerDamageDealt:   p.reduce((s, t) => s + t.damage_dealt, 0),
            opponentDamageDealt: o.reduce((s, t) => s + t.damage_dealt, 0),
            playerBestMove:      best(p),
            opponentBestMove:    best(o),
        };
    }, [turns]);

    useEffect(() => {
        if (phase !== 'playing') return;

        if (turnIdx >= turns.length) {
            later(() => setPhase('finished'), 500);
            return;
        }

        const t = turns[turnIdx];
        const attackerIsPlayer = t.attacker === 'player';

        later(() => {
            setPlayerAnim(attackerIsPlayer ? 'battle-lunge-right' : '');
            setOpponentAnim(!attackerIsPlayer ? 'battle-lunge-left' : '');
        }, ATTACK_MS);

        later(() => {
            if (attackerIsPlayer && t.damage_dealt > 0) setOpponentAnim('battle-hit');
            if (!attackerIsPlayer && t.damage_dealt > 0) setPlayerAnim('battle-hit');
            setPlayerHp(t.player_hp_remaining);
            setOpponentHp(t.opponent_hp_remaining);
            if (t.player_hp_remaining <= 0)   setPlayerFainted(true);
            if (t.opponent_hp_remaining <= 0) setOpponentFainted(true);
        }, HIT_MS);

        later(() => {
            setPlayerAnim('');
            setOpponentAnim('');
            setTurnIdx(i => i + 1);
        }, TURN_MS);
    }, [phase, turnIdx]);

    const startReplay = () => {
        clearAll();
        setPhase('playing');
        setTurnIdx(0);
        setPlayerHp(player.max_hp);
        setOpponentHp(opponent.max_hp);
        setPlayerFainted(false);
        setOpponentFainted(false);
        setPlayerAnim('');
        setOpponentAnim('');
    };

    const skipToEnd = () => {
        clearAll();
        const last = turns[turns.length - 1];
        if (last) {
            setPlayerHp(last.player_hp_remaining);
            setOpponentHp(last.opponent_hp_remaining);
            setPlayerFainted(last.player_hp_remaining <= 0);
            setOpponentFainted(last.opponent_hp_remaining <= 0);
        }
        setTurnIdx(turns.length);
        setPhase('finished');
    };

    const finished = phase === 'finished';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <Link href={route('battles.index')} className="text-sm text-gray-400 hover:text-gray-600">
                        ← Histórico
                    </Link>
                    <span className="text-gray-300">/</span>
                    <h2 className="text-xl font-semibold text-gray-800">Batalha #{battle.id}</h2>
                    {result && <ResultBadge result={result} />}
                </div>
            }
        >
            <Head title={`Batalha #${battle.id}`} />

            <div className="py-6">
                <div className="mx-auto max-w-lg px-4">

                    {/* Arena */}
                    <Arena
                        player={player} opponent={opponent}
                        playerHp={playerHp} opponentHp={opponentHp}
                        playerAnim={playerAnim} opponentAnim={opponentAnim}
                        playerFainted={playerFainted} opponentFainted={opponentFainted}
                        phase={phase} turnIdx={turnIdx} totalTurns={turns.length}
                    />

                    {/* Live log */}
                    {!finished && (
                        <div className="mt-3">
                            <LiveLog turns={turns} currentIdx={turnIdx} />
                        </div>
                    )}

                    {/* Controls */}
                    <div className="mt-3 flex justify-center gap-3">
                        {phase === 'ready' && (
                            <button
                                onClick={startReplay}
                                className="rounded-xl bg-indigo-600 px-8 py-3 text-base font-bold text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
                            >
                                ▶ Ver Batalha
                            </button>
                        )}
                        {phase === 'playing' && (
                            <>
                                <button
                                    onClick={skipToEnd}
                                    className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                                >
                                    ⏩ Pular
                                </button>
                            </>
                        )}
                        {finished && (
                            <button
                                onClick={startReplay}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                ▶ Rever animação
                            </button>
                        )}
                    </div>

                    {/* Result panel — only when finished */}
                    {finished && <ResultPanel battle={battle} stats={stats} />}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function ResultBadge({ result }) {
    const map = {
        win:  { label: '🏆 Vitória', cls: 'bg-yellow-100 text-yellow-700' },
        loss: { label: '💀 Derrota', cls: 'bg-red-100 text-red-600' },
        draw: { label: '🤝 Empate',  cls: 'bg-gray-100 text-gray-600' },
    };
    const { label, cls } = map[result] ?? map.draw;
    return <span className={`text-xs font-bold px-3 py-1 rounded-full ${cls}`}>{label}</span>;
}
