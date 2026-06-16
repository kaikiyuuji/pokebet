import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { getTypeStyle } from '@/lib/pokemon';

// ── helpers ─────────────────────────────────────────────────────────────────

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
    const map = {
        win:  { label: 'Vitória',  emoji: '🏆', from: 'from-green-500',  to: 'to-emerald-600' },
        loss: { label: 'Derrota',  emoji: '💀', from: 'from-red-500',    to: 'to-rose-700'    },
        draw: { label: 'Empate',   emoji: '🤝', from: 'from-yellow-400', to: 'to-amber-500'   },
    };
    const { label, emoji, from, to } = map[result] ?? { label: result, emoji: '❓', from: 'from-gray-400', to: 'to-gray-500' };

    return (
        <div className={`rounded-xl bg-gradient-to-r ${from} ${to} p-5 text-white flex items-center gap-4`}>
            <span className="text-4xl">{emoji}</span>
            <div>
                <p className="text-xl font-extrabold tracking-wide">{label}</p>
                <p className="text-sm opacity-90 mt-0.5 flex items-center gap-1">
                    <span>🪙</span> <span>{coinsAwarded} moedas ganhas</span>
                </p>
            </div>
        </div>
    );
}

function StatCard({ label, value }) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
            <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide">{label}</p>
            <p className="text-xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
    );
}

function HpBar({ current, max, color = 'bg-green-500' }) {
    const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
    const barColor = pct > 50 ? 'bg-green-500' : pct > 20 ? 'bg-yellow-400' : 'bg-red-500';
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-gray-200">
                <div
                    className={`h-2 rounded-full transition-all ${barColor}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-xs text-gray-500 w-20 text-right tabular-nums">
                {current}/{max}
            </span>
        </div>
    );
}

function EffLabel({ label }) {
    const map = {
        'super-effective':    'text-green-600 font-bold',
        'not-very-effective': 'text-red-500',
        'immune':             'text-gray-400',
        'normal':             'text-gray-500',
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

// ── main component ────────────────────────────────────────────────────────────

export default function Log({ battle }) {
    const [filter, setFilter] = useState('all');

    const stats = useMemo(() => {
        const turns = battle.turns;
        const playerTurns = turns.filter(t => t.attacker === 'player');
        const opponentTurns = turns.filter(t => t.attacker === 'opponent');

        const bestMove = (arr) => arr.reduce((best, t) => (!best || t.damage_dealt > best.damage_dealt ? t : best), null);

        return {
            totalTurns: turns.length,
            playerDmg: playerTurns.reduce((s, t) => s + t.damage_dealt, 0),
            opponentDmg: opponentTurns.reduce((s, t) => s + t.damage_dealt, 0),
            playerCrits: playerTurns.filter(t => t.is_critical).length,
            opponentCrits: opponentTurns.filter(t => t.is_critical).length,
            playerBest: bestMove(playerTurns),
            opponentBest: bestMove(opponentTurns),
        };
    }, [battle.turns]);

    const visibleTurns = useMemo(() => {
        if (filter === 'player') return battle.turns.filter(t => t.attacker === 'player');
        if (filter === 'opponent') return battle.turns.filter(t => t.attacker === 'opponent');
        if (filter === 'critical') return battle.turns.filter(t => t.is_critical);
        return battle.turns;
    }, [battle.turns, filter]);

    const playerName = battle.player.pokemon.name;
    const opponentName = battle.opponent.pokemon.name;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">📋 Log de Batalha #{battle.id}</h2>
                        <p className="text-xs text-gray-400 mt-0.5">{battle.created_at} · seed: {battle.random_seed}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={route('battles.index')}
                            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            ← Histórico
                        </Link>
                        <Link
                            href={route('battle.new')}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
                        >
                            ⚔️ Nova Batalha
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Log de Batalha #${battle.id}`} />

            <div className="py-8 px-4">
                <div className="mx-auto max-w-5xl space-y-6">

                    {/* Result banner */}
                    <ResultBanner result={battle.result} coinsAwarded={battle.coins_awarded} />

                    {/* Combatants */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Seu Pokémon', side: battle.player },
                            { label: 'Oponente',    side: battle.opponent },
                        ].map(({ label, side }) => (
                            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                                <img
                                    src={side.pokemon.sprite}
                                    alt={side.pokemon.name}
                                    className="w-16 h-16 object-contain shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">{label}</p>
                                    <p className="font-bold capitalize text-gray-800 truncate">{side.pokemon.name}</p>
                                    <div className="flex gap-1 mt-1">
                                        {side.pokemon.primary_type && (
                                            <TypeBadge slug={side.pokemon.primary_type.slug} name={side.pokemon.primary_type.name} />
                                        )}
                                        {side.pokemon.secondary_type && (
                                            <TypeBadge slug={side.pokemon.secondary_type.slug} name={side.pokemon.secondary_type.name} />
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Nv. {side.level} · HP: {side.max_hp}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <StatCard label="Turnos" value={stats.totalTurns} />
                        <StatCard label="Dano (você)" value={stats.playerDmg} />
                        <StatCard label="Dano (oponente)" value={stats.opponentDmg} />
                        <StatCard label="Críticos" value={`${stats.playerCrits} / ${stats.opponentCrits}`} />
                    </div>

                    {/* Best moves */}
                    {(stats.playerBest || stats.opponentBest) && (
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Seu melhor golpe', turn: stats.playerBest },
                                { label: 'Melhor golpe do oponente', turn: stats.opponentBest },
                            ].map(({ label, turn }) => turn && (
                                <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
                                    <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">{label}</p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-gray-800 capitalize">{turn.move_name}</span>
                                        <TypeBadge slug={turn.move_type} name={turn.move_type} />
                                        {turn.stab && (
                                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded px-1">STAB</span>
                                        )}
                                        {turn.is_critical && (
                                            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 border border-purple-200 rounded px-1">★ Crítico</span>
                                        )}
                                    </div>
                                    <p className="text-2xl font-extrabold text-gray-800 mt-1">{turn.damage_dealt} <span className="text-sm font-normal text-gray-400">de dano</span></p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Turn log */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
                            <h3 className="font-bold text-gray-800">Turnos ({battle.turns.length})</h3>
                            <div className="flex gap-1.5 flex-wrap">
                                {[
                                    { value: 'all',      label: 'Todos' },
                                    { value: 'player',   label: `${playerName}` },
                                    { value: 'opponent', label: `${opponentName}` },
                                    { value: 'critical', label: '★ Críticos' },
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setFilter(opt.value)}
                                        className={[
                                            'px-3 py-1 rounded-full text-xs font-medium border transition-colors capitalize',
                                            filter === opt.value
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
                                        ].join(' ')}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                    <tr>
                                        <th className="px-4 py-2 text-left">#</th>
                                        <th className="px-4 py-2 text-left">Atacante</th>
                                        <th className="px-4 py-2 text-left">Golpe</th>
                                        <th className="px-4 py-2 text-right">Dano</th>
                                        <th className="px-4 py-2 text-left">Efetividade</th>
                                        <th className="px-4 py-2 text-right">HP 🗡️</th>
                                        <th className="px-4 py-2 text-right">HP 👾</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {visibleTurns.map((t) => {
                                        const isPlayer = t.attacker === 'player';
                                        return (
                                            <tr
                                                key={t.turn_number}
                                                className={`hover:bg-gray-50 transition-colors ${t.is_critical ? 'bg-purple-50/40' : ''}`}
                                            >
                                                <td className="px-4 py-2.5 text-gray-400 tabular-nums">{t.turn_number}</td>
                                                <td className="px-4 py-2.5">
                                                    <span className={`font-medium capitalize ${isPlayer ? 'text-indigo-700' : 'text-rose-600'}`}>
                                                        {isPlayer ? playerName : opponentName}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="font-medium text-gray-700 capitalize">{t.move_name}</span>
                                                        <TypeBadge slug={t.move_type} name={t.move_type} />
                                                        {t.stab && (
                                                            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded px-1">STAB</span>
                                                        )}
                                                        {t.is_critical && (
                                                            <span className="text-[9px] font-bold text-purple-600 bg-purple-50 border border-purple-200 rounded px-1">★</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2.5 text-right font-bold tabular-nums text-gray-800">
                                                    {t.damage_dealt}
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <EffLabel label={t.effectiveness} />
                                                </td>
                                                <td className="px-4 py-2.5 text-right tabular-nums text-indigo-700 font-medium">
                                                    {t.player_hp_remaining}
                                                </td>
                                                <td className="px-4 py-2.5 text-right tabular-nums text-rose-600 font-medium">
                                                    {t.opponent_hp_remaining}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {visibleTurns.length === 0 && (
                                <p className="text-center text-gray-400 text-sm py-8">Nenhum turno encontrado para este filtro.</p>
                            )}
                        </div>
                    </div>

                    {/* HP progression mini-chart (text-based) */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
                        <h3 className="font-bold text-gray-800 text-sm">HP Final</h3>
                        {battle.turns.length > 0 && (() => {
                            const last = battle.turns[battle.turns.length - 1];
                            return (
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span className="capitalize font-medium text-indigo-700">{playerName}</span>
                                            <span>{last.player_hp_remaining} / {battle.player.max_hp}</span>
                                        </div>
                                        <HpBar current={last.player_hp_remaining} max={battle.player.max_hp} />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span className="capitalize font-medium text-rose-600">{opponentName}</span>
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
