import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { getTypeStyle } from '@/lib/pokemon';
import {
    Trophy, Skull, Handshake, Coins, Swords, Sword, Bot,
    ClipboardList, ChevronLeft, Star,
} from 'lucide-react';

function TypeBadge({ slug, name }) {
    if (!slug) return null;
    const { bg, text } = getTypeStyle(slug);
    return (
        <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${bg} ${text}`}>
            {name ?? slug}
        </span>
    );
}

function ResultBanner({ result, coinsAwarded }) {
    const isLoss = result === 'loss';
    const map = {
        win: { label: 'Vitória', Icon: Trophy, tone: 'result-banner--win' },
        loss: { label: 'Derrota', Icon: Skull, tone: 'result-banner--loss' },
        draw: { label: 'Empate', Icon: Handshake, tone: 'result-banner--draw' },
    };
    const { label, Icon, tone } = map[result] ?? { label: result, Icon: Swords, tone: 'result-banner--draw' };

    return (
        <div className={`result-banner ${tone} poke-card animate-pop flex items-center gap-4 p-5 text-white`}>
            <Icon className="w-10 h-10 opacity-90 shrink-0" />
            <div>
                <p className="text-xl font-extrabold tracking-wide">{label}</p>
                <p className="text-sm opacity-90 mt-0.5 flex items-center gap-1.5">
                    <Coins className="w-4 h-4" />
                    <span>{isLoss ? '-' : '+'}{coinsAwarded} moedas</span>
                </p>
            </div>
        </div>
    );
}

function StatCard({ label, value }) {
    return (
        <div className="poke-card p-3 text-center">
            <p className="text-xs font-bold uppercase text-app-soft">{label}</p>
            <p className="text-xl font-black text-app mt-1">{value}</p>
        </div>
    );
}

function HpBar({ current, max }) {
    const pct      = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
    const barColor = pct > 50 ? 'bg-green-500' : pct > 20 ? 'bg-yellow-400' : 'bg-red-500';
    return (
        <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-[var(--surface-muted)]">
                <div className={`h-2 rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-app-muted w-20 text-right tabular-nums">{current}/{max}</span>
        </div>
    );
}

function EffLabel({ label }) {
    const map = {
        'super-effective': 'effectiveness--super',
        'not-very-effective': 'effectiveness--weak',
        'immune': 'effectiveness--immune',
        'normal': 'text-app-soft',
    };
    const names = {
        'super-effective':    'Super efetivo',
        'not-very-effective': 'Pouco efetivo',
        'immune':             'Imune',
        'normal':             '—',
    };
    return (
        <span className={`text-xs ${map[label] ?? 'text-gray-500'}`}>
            {names[label] ?? label}
        </span>
    );
}

export default function Log({ battle }) {
    const [filter, setFilter] = useState('all');

    const stats = useMemo(() => {
        const turns        = battle.turns;
        const playerTurns  = turns.filter(t => t.attacker === 'player');
        const opponentTurns = turns.filter(t => t.attacker === 'opponent');
        const bestMove     = (arr) => arr.reduce((best, t) => (!best || t.damage_dealt > best.damage_dealt ? t : best), null);

        return {
            totalTurns:    turns.length,
            playerDmg:     playerTurns.reduce((s, t) => s + t.damage_dealt, 0),
            opponentDmg:   opponentTurns.reduce((s, t) => s + t.damage_dealt, 0),
            playerCrits:   playerTurns.filter(t => t.is_critical).length,
            opponentCrits: opponentTurns.filter(t => t.is_critical).length,
            playerBest:    bestMove(playerTurns),
            opponentBest:  bestMove(opponentTurns),
        };
    }, [battle.turns]);

    const visibleTurns = useMemo(() => {
        if (filter === 'player')   return battle.turns.filter(t => t.attacker === 'player');
        if (filter === 'opponent') return battle.turns.filter(t => t.attacker === 'opponent');
        if (filter === 'critical') return battle.turns.filter(t => t.is_critical);
        return battle.turns;
    }, [battle.turns, filter]);

    const playerName   = battle.player.pokemon.name;
    const opponentName = battle.opponent.pokemon.name;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-end justify-between gap-5">
                    <div>
                        <p className="technical-label text-[var(--accent)]">04 / Telemetria completa</p>
                        <h1 className="mt-3 text-4xl font-medium tracking-[-0.06em] text-app">Log #{battle.id}</h1>
                        <p className="technical-label mt-2">{battle.created_at} / seed: {battle.random_seed}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={route('battles.index')}
                            className="btn-quiet flex items-center gap-1 px-4 py-2 text-sm font-semibold"
                        >
                            <ChevronLeft className="w-4 h-4" /> Histórico
                        </Link>
                        <Link
                            href={route('battle.new')}
                            className="btn-poke flex items-center gap-2 px-4 py-2 text-sm font-bold"
                        >
                            <Swords className="w-4 h-4" /> Nova Batalha
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Log de Batalha #${battle.id}`} />

            <div className="app-frame px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl space-y-6">

                    <ResultBanner result={battle.result} coinsAwarded={battle.coins_awarded} />

                    {/* Combatants */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {[
                            { label: 'Seu Pokémon', side: battle.player },
                            { label: 'Oponente',    side: battle.opponent },
                        ].map(({ label, side }) => (
                            <div key={label} className="poke-card hover-lift p-4 flex items-center gap-3">
                                <img
                                    src={side.pokemon.sprite}
                                    alt={side.pokemon.name}
                                    className="w-16 h-16 object-contain shrink-0"
                                    style={{ imageRendering: 'pixelated' }}
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-bold uppercase text-app-soft mb-1">{label}</p>
                                    <p className="font-black capitalize text-app truncate">{side.pokemon.name}</p>
                                    <div className="flex gap-1 mt-1">
                                        {side.pokemon.primary_type && (
                                            <TypeBadge slug={side.pokemon.primary_type.slug} name={side.pokemon.primary_type.name} />
                                        )}
                                        {side.pokemon.secondary_type && (
                                            <TypeBadge slug={side.pokemon.secondary_type.slug} name={side.pokemon.secondary_type.name} />
                                        )}
                                    </div>
                                    <p className="text-xs text-app-muted mt-1">Nv. {side.level} · HP: {side.max_hp}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <StatCard label="Turnos"          value={stats.totalTurns} />
                        <StatCard label="Dano (você)"     value={stats.playerDmg} />
                        <StatCard label="Dano (oponente)" value={stats.opponentDmg} />
                        <StatCard label="Críticos"        value={`${stats.playerCrits} / ${stats.opponentCrits}`} />
                    </div>

                    {/* Best moves */}
                    {(stats.playerBest || stats.opponentBest) && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {[
                                { label: 'Seu melhor golpe',           turn: stats.playerBest },
                                { label: 'Melhor golpe do oponente',   turn: stats.opponentBest },
                            ].map(({ label, turn }) => turn && (
                                <div key={label} className="poke-card hover-lift p-4">
                                    <p className="text-[10px] font-bold uppercase text-app-soft mb-2">{label}</p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-app capitalize">{turn.move_name}</span>
                                        <TypeBadge slug={turn.move_type} name={turn.move_type} />
                                        {turn.stab && (
                                            <span className="border border-[var(--accent)] bg-[var(--accent-soft)] px-1 text-[10px] font-bold text-[var(--accent)]">STAB</span>
                                        )}
                                        {turn.is_critical && (
                                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-purple-600 bg-purple-50 border border-purple-200 rounded px-1">
                                                <Star className="w-2.5 h-2.5" /> Crítico
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-2xl font-black text-app mt-1">
                                        {turn.damage_dealt} <span className="text-sm font-normal text-app-soft">de dano</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Turn log */}
                    <div className="poke-card overflow-hidden">
                        <div className="px-4 py-3 border-b border-app flex items-center justify-between flex-wrap gap-2">
                            <h3 className="font-black text-app">Turnos ({battle.turns.length})</h3>
                            <div className="flex gap-1.5 flex-wrap">
                                {[
                                    { value: 'all',      label: 'Todos' },
                                    { value: 'player',   label: playerName },
                                    { value: 'opponent', label: opponentName },
                                    { value: 'critical', label: 'Críticos' },
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setFilter(opt.value)}
                                        className={[
                                            'px-3 py-1 rounded-full text-xs font-bold border transition-all capitalize hover:-translate-y-0.5',
                                            filter === opt.value
                                                ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                                                : 'bg-app-surface text-app-muted border-app hover:text-app',
                                        ].join(' ')}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-[var(--surface-strong)] text-xs text-app-muted uppercase">
                                    <tr>
                                        <th className="px-4 py-2 text-left">#</th>
                                        <th className="px-4 py-2 text-left">Atacante</th>
                                        <th className="px-4 py-2 text-left">Golpe</th>
                                        <th className="px-4 py-2 text-right">Dano</th>
                                        <th className="px-4 py-2 text-left">Efetividade</th>
                                        <th className="px-4 py-2 text-right">
                                            <Sword className="w-3 h-3 inline" /> HP
                                        </th>
                                        <th className="px-4 py-2 text-right">
                                            <Bot className="w-3 h-3 inline" /> HP
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                    {visibleTurns.map((t) => {
                                        const isPlayer = t.attacker === 'player';
                                        const AttIcon  = isPlayer ? Sword : Bot;
                                        return (
                                            <tr
                                                key={t.turn_number}
                                                className={`transition-colors hover:bg-[var(--surface-strong)] ${t.is_critical ? 'bg-purple-500/10' : ''}`}
                                            >
                                                <td className="px-4 py-2.5 text-app-soft tabular-nums">{t.turn_number}</td>
                                                <td className="px-4 py-2.5">
                                                    <span className={`flex items-center gap-1.5 font-medium capitalize ${isPlayer ? 'text-[var(--accent)]' : 'text-app-muted'}`}>
                                                        <AttIcon className="w-3.5 h-3.5" />
                                                        {isPlayer ? playerName : opponentName}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="font-medium text-app capitalize">{t.move_name}</span>
                                                        <TypeBadge slug={t.move_type} name={t.move_type} />
                                                        {t.stab && (
                                                            <span className="border border-[var(--accent)] bg-[var(--accent-soft)] px-1 text-[9px] font-bold text-[var(--accent)]">STAB</span>
                                                        )}
                                                        {t.is_critical && (
                                                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-purple-600 bg-purple-50 border border-purple-200 rounded px-1">
                                                                <Star className="w-2.5 h-2.5" />
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2.5 text-right font-bold tabular-nums text-app">
                                                    {t.damage_dealt}
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <EffLabel label={t.effectiveness} />
                                                </td>
                                                <td className="px-4 py-2.5 text-right tabular-nums text-app-muted font-medium">
                                                    {t.player_hp_remaining}
                                                </td>
                                                <td className="px-4 py-2.5 text-right tabular-nums text-app-muted font-medium">
                                                    {t.opponent_hp_remaining}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {visibleTurns.length === 0 && (
                                                    <p className="text-center text-app-soft text-sm py-8">Nenhum turno encontrado para este filtro.</p>
                            )}
                        </div>
                    </div>

                    {/* HP Final */}
                    <div className="poke-card p-4 space-y-4">
                        <h3 className="font-black text-app text-sm">HP Final</h3>
                        {battle.turns.length > 0 && (() => {
                            const last = battle.turns[battle.turns.length - 1];
                            return (
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-xs text-app-muted mb-1">
                                            <span className="capitalize font-medium text-[var(--accent)]">{playerName}</span>
                                            <span>{last.player_hp_remaining} / {battle.player.max_hp}</span>
                                        </div>
                                        <HpBar current={last.player_hp_remaining} max={battle.player.max_hp} />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs text-app-muted mb-1">
                                            <span className="capitalize font-medium text-app-muted">{opponentName}</span>
                                            <span>{last.opponent_hp_remaining} / {battle.opponent.max_hp}</span>
                                        </div>
                                        <HpBar current={last.opponent_hp_remaining} max={battle.opponent.max_hp} />
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
