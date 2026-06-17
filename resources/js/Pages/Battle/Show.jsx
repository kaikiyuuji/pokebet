import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatPokedexNumber, getTypeStyle } from '@/lib/pokemon';
import { sound } from '@/hooks/useSound';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Trophy, Skull, Handshake, Sword, Bot, ClipboardList, Play, ChevronsRight,
    Star, Sparkles, Leaf, Coins, ChevronLeft, ChevronDown, ChevronUp,
    Swords, ScrollText, ArrowRight, Check,
} from 'lucide-react';

// ── Timing constants ───────────────────────────────────────────────────────────
const TURN_MS   = 1500;
const ATTACK_MS = 350;
const HIT_MS    = 650;

// ── Helpers ───────────────────────────────────────────────────────────────────
function hpColor(pct) {
    if (pct > 0.5) return 'bg-green-400';
    if (pct > 0.2) return 'bg-yellow-400';
    return 'bg-red-500';
}

function effectivenessLabel(eff) {
    switch (eff) {
        case 'super-effective':
        case 'double-super-effective': return { text: 'Super efetivo!', cls: 'text-pink-300' };
        case 'not-very-effective':      return { text: 'Fraco…',         cls: 'text-blue-300' };
        case 'immune':                  return { text: 'Sem efeito!',    cls: 'text-gray-400' };
        default:                        return null;
    }
}

// ── HP Bar (Pokémon DS style) ──────────────────────────────────────────────────
function HpBar({ current, max, name, level }) {
    const pct = max > 0 ? Math.max(0, current) / max : 0;

    return (
        <div className="bg-black bg-opacity-70 rounded-lg px-3 py-2 w-44">
            <div className="flex items-baseline justify-between mb-1">
                <span className="font-pixel text-[8px] text-white leading-none capitalize truncate max-w-[100px]">{name}</span>
                <span className="font-pixel text-[7px] text-slate-400 leading-none ml-2 shrink-0">Lv.{level}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <span className="font-pixel text-[7px] text-green-400 shrink-0">HP</span>
                <div className="flex-1 h-2.5 rounded-sm bg-gray-800 overflow-hidden border border-gray-700">
                    <div
                        className={`h-full rounded-sm ${hpColor(pct)}`}
                        style={{ width: `${(pct * 100).toFixed(1)}%`, transition: 'width 900ms ease-out' }}
                    />
                </div>
            </div>
            <span className="font-pixel text-[7px] text-slate-400 mt-1 block">
                {Math.max(0, current)}/{max}
            </span>
        </div>
    );
}

// ── Pokémon Sprite ─────────────────────────────────────────────────────────────
function PokemonSprite({ pokemon, side, animClass, fainted }) {
    const src      = pokemon.sprite ?? '/images/pokemon-placeholder.png';
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
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-3 h-24 font-mono text-xs overflow-hidden flex flex-col gap-1">
            {visible.length === 0 && <span className="text-slate-600">Aguardando…</span>}
            {visible.map((t, i) => {
                const eff = effectivenessLabel(t.effectiveness);
                const AttackerIcon = t.attacker === 'player' ? Sword : Bot;
                return (
                    <div key={currentIdx - i} className={`flex items-center gap-1.5 ${i > 0 ? 'opacity-40' : ''}`}>
                        <AttackerIcon className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="text-white">{t.move_name}</span>
                        {t.damage_dealt > 0 && <span className="text-green-400">−{t.damage_dealt}</span>}
                        {t.is_critical && <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />}
                        {eff && <span className={eff.cls}>{eff.text}</span>}
                    </div>
                );
            })}
        </div>
    );
}

// ── Arena ──────────────────────────────────────────────────────────────────────
// Layout: each Pokémon's sprite and HP bar share the same visual zone.
//   Opponent zone (sky, top): HP info LEFT ←→ sprite RIGHT
//   Player   zone (grass, bottom): sprite LEFT ←→ HP info RIGHT
function Arena({ player, opponent, playerHp, opponentHp, playerAnim, opponentAnim, playerFainted, opponentFainted, phase, turnIdx, totalTurns }) {
    return (
        <div className="rounded-2xl border-4 border-gray-800 overflow-hidden shadow-2xl">

            {/* ── Opponent zone: sky ───────────────────── */}
            <div className="battle-sky flex items-end justify-between px-4 pt-4 pb-2 gap-3" style={{ minHeight: '11rem' }}>
                {/* HP info anchored to top-left */}
                <div className="self-start mt-1">
                    <span className="font-pixel text-[6px] text-sky-700 uppercase tracking-widest block mb-1.5">Inimigo</span>
                    <HpBar current={opponentHp} max={opponent.max_hp} name={opponent.pokemon.name} level={opponent.level} />
                </div>
                {/* Sprite sits at the bottom of sky zone */}
                <PokemonSprite pokemon={opponent.pokemon} side="opponent" animClass={opponentAnim} fainted={opponentFainted} />
            </div>

            {/* ── Divider with VS / turn counter ──────── */}
            <div className="battle-divider flex items-center justify-center" style={{ height: 28 }}>
                {phase === 'ready' && (
                    <span className="font-pixel text-[10px] text-gray-700 bg-white bg-opacity-80 px-3 py-0.5 rounded-full shadow-sm">VS</span>
                )}
                {phase === 'playing' && (
                    <span className="font-pixel text-[8px] text-gray-700 bg-white bg-opacity-80 px-2 py-0.5 rounded-full shadow-sm tabular-nums">
                        {turnIdx}/{totalTurns}
                    </span>
                )}
            </div>

            {/* ── Player zone: grass ───────────────────── */}
            <div className="battle-grass flex items-end justify-between px-4 pt-2 pb-4 gap-3" style={{ minHeight: '11rem' }}>
                {/* Sprite sits at the bottom of grass zone */}
                <PokemonSprite pokemon={player.pokemon} side="player" animClass={playerAnim} fainted={playerFainted} />
                {/* HP info anchored to top-right */}
                <div className="self-start mt-1 flex flex-col items-end">
                    <span className="font-pixel text-[6px] text-green-900 uppercase tracking-widest block mb-1.5 text-right">Você</span>
                    <HpBar current={playerHp} max={player.max_hp} name={player.pokemon.name} level={player.level} />
                </div>
            </div>
        </div>
    );
}

// ── Result panel ───────────────────────────────────────────────────────────────
function ResultPanel({ battle, stats }) {
    const [logOpen, setLogOpen] = useState(false);
    const { result, coins_awarded, luck_tier, player, opponent, turns } = battle;
    const isLoss = result === 'loss';

    const cfg = {
        win:  { Icon: Trophy,   label: 'Vitória!', banner: 'from-yellow-400 to-amber-500',  text: 'text-amber-900' },
        loss: { Icon: Skull,    label: 'Derrota…', banner: 'from-gray-800 to-slate-900',    text: 'text-slate-200' },
        draw: { Icon: Handshake, label: 'Empate!', banner: 'from-indigo-600 to-purple-700', text: 'text-white' },
    }[result] ?? { Icon: Swords, label: result, banner: 'from-gray-600 to-gray-700', text: 'text-white' };

    const LuckIcon  = luck_tier === 'jackpot' ? Star : luck_tier === 'super_lucky' ? Sparkles : Leaf;
    const luckText  = luck_tier === 'jackpot' ? 'JACKPOT!' : luck_tier === 'super_lucky' ? 'SUPER SORTE!' : luck_tier === 'lucky' ? 'Sorte!' : null;
    const showLuck  = !isLoss && luckText;

    return (
        <div className="mt-4 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            {/* Banner */}
            <div className={`bg-gradient-to-r ${cfg.banner} px-6 py-5 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                    <cfg.Icon className={`w-10 h-10 ${cfg.text}`} />
                    <div>
                        <h2 className={`font-pixel text-sm ${cfg.text}`}>{cfg.label}</h2>
                        {showLuck && (
                            <div className={`flex items-center gap-1 mt-1 ${
                                luck_tier === 'jackpot' ? 'text-yellow-300' :
                                luck_tier === 'super_lucky' ? 'text-pink-200' : 'text-green-200'
                            }`}>
                                <LuckIcon className="w-3 h-3" />
                                <span className="font-pixel text-[8px]">{luckText}</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className={`flex flex-col items-end ${cfg.text}`}>
                    <span className="text-xs opacity-70">{isLoss ? 'moedas perdidas' : 'moedas ganhas'}</span>
                    <div className={`flex items-center gap-1.5 text-2xl font-black mt-0.5 ${isLoss ? 'text-red-400' : ''}`}>
                        <Coins className="w-6 h-6" />
                        <span>{isLoss ? '-' : '+'}{coins_awarded}</span>
                    </div>
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
                    <BestMoveCell move={stats.playerBestMove} label="Seu melhor golpe" />
                    <BestMoveCell move={stats.opponentBestMove} label="Golpe inimigo" />
                </div>
            )}

            {/* Battle log toggle */}
            <div className="border-t border-gray-100">
                <button
                    onClick={() => setLogOpen(v => !v)}
                    className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    <span className="flex items-center gap-2">
                        <ClipboardList className="w-4 h-4" />
                        Log da batalha <span className="font-normal text-gray-400">({turns.length} turnos)</span>
                    </span>
                    {logOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>

                {logOpen && <BattleLogTable turns={turns} player={player} opponent={opponent} />}
            </div>

            {/* Actions */}
            <div className="border-t border-gray-100 px-5 py-4 flex flex-wrap gap-3 justify-center">
                <Link
                    href={route('battle.new')}
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 shadow transition-colors"
                >
                    <Swords className="w-4 h-4" /> Nova Batalha
                </Link>
                <Link
                    href={route('battles.log', battle.id)}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    <ClipboardList className="w-4 h-4" /> Log completo
                </Link>
                <Link
                    href={route('battles.index')}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    <ScrollText className="w-4 h-4" /> Histórico
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

function BestMoveCell({ move, label }) {
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
                        <th className="px-3 py-2 font-medium text-right">
                            <Sword className="w-3 h-3 inline" /> HP
                        </th>
                        <th className="px-3 py-2 font-medium text-right">
                            <Bot className="w-3 h-3 inline" /> HP
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {turns.map((t) => {
                        const eff       = effectivenessLabel(t.effectiveness);
                        const isPlayer  = t.attacker === 'player';
                        const typeStyle = t.move_type ? getTypeStyle(t.move_type) : null;
                        const AttIcon   = isPlayer ? Sword : Bot;

                        return (
                            <tr
                                key={t.turn_number}
                                className={`border-b border-gray-50 transition-colors ${
                                    isPlayer ? 'hover:bg-red-50' : 'hover:bg-slate-50'
                                }`}
                            >
                                <td className="px-3 py-1.5 text-gray-400 font-mono">{t.turn_number}</td>
                                <td className="px-3 py-1.5">
                                    <span className={`inline-flex items-center gap-1 font-medium ${
                                        isPlayer ? 'text-red-600' : 'text-slate-500'
                                    }`}>
                                        <AttIcon className="w-3 h-3" />
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
                                            {t.is_critical && <Star className="w-3 h-3 inline ml-1 text-yellow-500 fill-yellow-500" />}
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
    const { player, opponent, turns, result, coins_awarded, luck_tier } = battle;

    const [phase, setPhase]               = useState('ready');
    const [turnIdx, setTurnIdx]           = useState(0);
    const [playerHp, setPlayerHp]         = useState(player.max_hp);
    const [opponentHp, setOpponentHp]     = useState(opponent.max_hp);
    const [playerAnim, setPlayerAnim]     = useState('');
    const [opponentAnim, setOpponentAnim] = useState('');
    const [playerFainted, setPlayerFainted]     = useState(false);
    const [opponentFainted, setOpponentFainted] = useState(false);

    const timers = useRef([]);
    const later  = (fn, ms) => { const t = setTimeout(fn, ms); timers.current.push(t); };
    const clearAll = () => { timers.current.forEach(clearTimeout); timers.current = []; };
    useEffect(() => () => clearAll(), []);

    // Play result sound when battle ends
    useEffect(() => {
        if (phase !== 'finished') return;
        const id = setTimeout(() => {
            if (result === 'win') {
                luck_tier === 'jackpot' ? sound.jackpot() : sound.victory();
            } else if (result === 'loss') {
                sound.defeat();
            } else {
                sound.draw();
            }
        }, 400);
        return () => clearTimeout(id);
    }, [phase]);

    // Battle stats
    const stats = useMemo(() => {
        const p    = turns.filter(t => t.attacker === 'player');
        const o    = turns.filter(t => t.attacker === 'opponent');
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

        const t               = turns[turnIdx];
        const attackerIsPlayer = t.attacker === 'player';

        later(() => {
            setPlayerAnim(attackerIsPlayer ? 'battle-lunge-right' : '');
            setOpponentAnim(!attackerIsPlayer ? 'battle-lunge-left' : '');
            if (t.damage_dealt > 0) sound.attack();
        }, ATTACK_MS);

        later(() => {
            if (attackerIsPlayer && t.damage_dealt > 0) setOpponentAnim('battle-hit');
            if (!attackerIsPlayer && t.damage_dealt > 0) setPlayerAnim('battle-hit');
            setPlayerHp(t.player_hp_remaining);
            setOpponentHp(t.opponent_hp_remaining);
            if (t.player_hp_remaining <= 0)  setPlayerFainted(true);
            if (t.opponent_hp_remaining <= 0) setOpponentFainted(true);

            if (t.damage_dealt > 0) {
                const eff = t.effectiveness;
                if (eff === 'super-effective' || eff === 'double-super-effective') {
                    sound.superEffective();
                } else if (eff !== 'immune') {
                    sound.hit();
                }
                if (t.is_critical) sound.critical();
            }
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
                    <Link href={route('battles.index')} className="flex items-center gap-1 text-sm text-slate-400 hover:text-white">
                        <ChevronLeft className="w-4 h-4" /> Histórico
                    </Link>
                    <span className="text-slate-600">/</span>
                    <h2 className="text-xl font-semibold text-white">Batalha #{battle.id}</h2>
                    {result && <ResultBadge result={result} />}
                </div>
            }
        >
            <Head title={`Batalha #${battle.id}`} />

            <div className="py-6">
                <div className="mx-auto max-w-lg px-4">

                    <Arena
                        player={player} opponent={opponent}
                        playerHp={playerHp} opponentHp={opponentHp}
                        playerAnim={playerAnim} opponentAnim={opponentAnim}
                        playerFainted={playerFainted} opponentFainted={opponentFainted}
                        phase={phase} turnIdx={turnIdx} totalTurns={turns.length}
                    />

                    {!finished && (
                        <div className="mt-3">
                            <LiveLog turns={turns} currentIdx={turnIdx} />
                        </div>
                    )}

                    <div className="mt-3 flex justify-center gap-3">
                        {phase === 'ready' && (
                            <button
                                onClick={startReplay}
                                className="flex items-center gap-2 font-pixel text-[10px] rounded-xl bg-red-600 px-8 py-3 text-white hover:bg-red-700 shadow-lg transition-all active:scale-95"
                            >
                                <Play className="w-4 h-4" /> VER BATALHA
                            </button>
                        )}
                        {phase === 'playing' && (
                            <button
                                onClick={skipToEnd}
                                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <ChevronsRight className="w-4 h-4" /> Pular
                            </button>
                        )}
                        {finished && (
                            <button
                                onClick={startReplay}
                                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <Play className="w-4 h-4" /> Rever animação
                            </button>
                        )}
                    </div>

                    {finished && <ResultPanel battle={battle} stats={stats} />}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function ResultBadge({ result }) {
    const map = {
        win:  { label: 'Vitória', cls: 'bg-yellow-100 text-yellow-700', Icon: Trophy },
        loss: { label: 'Derrota', cls: 'bg-red-100 text-red-600',       Icon: Skull  },
        draw: { label: 'Empate',  cls: 'bg-gray-100 text-gray-600',     Icon: Handshake },
    };
    const { label, cls, Icon } = map[result] ?? map.draw;
    return (
        <span className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${cls}`}>
            <Icon className="w-3.5 h-3.5" /> {label}
        </span>
    );
}
