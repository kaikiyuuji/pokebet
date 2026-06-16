import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatPokedexNumber, getTypeStyle, STAT_LABELS, statPercent } from '@/lib/pokemon';
import { Head, Link } from '@inertiajs/react';

function TypeBadge({ type }) {
    if (!type) return null;
    const { bg, text } = getTypeStyle(type.slug);
    return (
        <span className={`${bg} ${text} px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide`}>
            {type.name}
        </span>
    );
}

function StatBar({ label, value, color }) {
    return (
        <div className="flex items-center gap-2 text-xs">
            <span className="w-12 text-right text-gray-500 font-medium shrink-0">{label}</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full ${color} transition-all`}
                    style={{ width: `${statPercent(value)}%` }}
                />
            </div>
            <span className="w-7 text-gray-700 font-semibold">{value}</span>
        </div>
    );
}

function PokemonPanel({ side, pokemon, level }) {
    const isPlayer = side === 'player';
    const { ring } = pokemon.primary_type ? getTypeStyle(pokemon.primary_type.slug) : { ring: 'ring-indigo-400' };

    return (
        <div className={`flex flex-col items-center gap-4 rounded-2xl border-2 bg-white p-6 shadow-sm ${ring} ring-1 flex-1 min-w-0`}>
            {/* Side label */}
            <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                isPlayer ? 'bg-indigo-100 text-indigo-700' : 'bg-red-100 text-red-700'
            }`}>
                {isPlayer ? '🗡️ Seu Pokémon' : '🎲 Oponente'}
            </span>

            {/* Sprite */}
            <div className="relative">
                <div className={`absolute inset-0 rounded-full blur-xl opacity-20 ${
                    pokemon.primary_type ? getTypeStyle(pokemon.primary_type.slug).bg : 'bg-indigo-400'
                }`} />
                <img
                    src={pokemon.sprite ?? pokemon.sprite_front ?? '/images/pokemon-placeholder.png'}
                    alt={pokemon.name}
                    className="relative h-32 w-32 object-contain drop-shadow-lg"
                    onError={(e) => { e.target.src = '/images/pokemon-placeholder.png'; }}
                />
            </div>

            {/* Name + number */}
            <div className="text-center">
                <p className="text-xs text-gray-400 font-mono">{formatPokedexNumber(pokemon.pokeapi_id)}</p>
                <h3 className="text-xl font-bold text-gray-900">{pokemon.name}</h3>
                <p className="text-sm text-gray-500 mt-0.5">Nível <span className="font-bold text-gray-700">{level}</span></p>
            </div>

            {/* Types */}
            <div className="flex gap-2">
                <TypeBadge type={pokemon.primary_type} />
                <TypeBadge type={pokemon.secondary_type} />
            </div>

            {/* Stats */}
            <div className="w-full space-y-1.5 pt-2 border-t border-gray-100">
                {Object.entries(STAT_LABELS).map(([key, { label, color }]) => (
                    <StatBar key={key} label={label} value={pokemon[key]} color={color} />
                ))}
                <div className="flex justify-between text-xs pt-1 border-t border-gray-100 mt-1">
                    <span className="text-gray-400">Total</span>
                    <span className="font-bold text-gray-700">{pokemon.base_total}</span>
                </div>
            </div>
        </div>
    );
}

export default function Show({ battle }) {
    const resolved = battle.result !== null;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <Link
                        href={route('battle.new')}
                        className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        ← Batalhas
                    </Link>
                    <span className="text-gray-300">/</span>
                    <h2 className="text-xl font-semibold text-gray-800">
                        Batalha #{battle.id}
                    </h2>
                    {resolved && (
                        <ResultBadge result={battle.result} />
                    )}
                </div>
            }
        >
            <Head title={`Batalha #${battle.id}`} />

            <div className="py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

                    {/* VS layout */}
                    <div className="flex flex-col sm:flex-row items-stretch gap-4">
                        <PokemonPanel
                            side="player"
                            pokemon={battle.player.pokemon}
                            level={battle.player.level}
                        />

                        {/* VS divider */}
                        <div className="flex items-center justify-center py-4 sm:py-0 sm:flex-col gap-2">
                            <div className="h-px w-12 sm:h-12 sm:w-px bg-gray-200" />
                            <span className="text-2xl font-black text-gray-300">VS</span>
                            <div className="h-px w-12 sm:h-12 sm:w-px bg-gray-200" />
                        </div>

                        <PokemonPanel
                            side="opponent"
                            pokemon={battle.opponent.pokemon}
                            level={battle.opponent.level}
                        />
                    </div>

                    {/* Level diff info */}
                    <LevelMatchupInfo player={battle.player} opponent={battle.opponent} />

                    {/* Action area */}
                    <div className="mt-6 flex flex-col items-center gap-3">
                        {!resolved ? (
                            <>
                                <div className="rounded-xl bg-amber-50 border border-amber-200 px-6 py-4 text-center max-w-md">
                                    <p className="text-sm font-semibold text-amber-800">⚙️ Simulação em desenvolvimento</p>
                                    <p className="text-xs text-amber-600 mt-1">
                                        O simulador de batalha ainda está sendo implementado. Em breve você poderá batalhar aqui!
                                    </p>
                                </div>
                                <Link
                                    href={route('battle.new')}
                                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                >
                                    ← Escolher outro Pokémon
                                </Link>
                            </>
                        ) : (
                            <Link
                                href={route('battle.new')}
                                className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow"
                            >
                                ⚔️ Nova Batalha
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function ResultBadge({ result }) {
    const styles = {
        win:  'bg-green-100 text-green-700',
        loss: 'bg-red-100 text-red-700',
        draw: 'bg-gray-100 text-gray-600',
    };
    const labels = { win: '🏆 Vitória', loss: '💀 Derrota', draw: '🤝 Empate' };

    return (
        <span className={`text-sm font-bold px-3 py-1 rounded-full ${styles[result] ?? styles.draw}`}>
            {labels[result] ?? result}
        </span>
    );
}

function LevelMatchupInfo({ player, opponent }) {
    const diff = Math.abs(player.level - opponent.level);
    const playerStronger = player.level > opponent.level;

    return (
        <div className="mt-4 rounded-xl bg-gray-50 border border-gray-100 px-5 py-3 flex items-center justify-center gap-6 text-sm text-gray-500">
            <span>Nível {player.level}</span>
            <span className="text-gray-300">·</span>
            <span className={`font-medium ${diff === 0 ? 'text-gray-400' : playerStronger ? 'text-green-600' : 'text-red-500'}`}>
                {diff === 0
                    ? 'Níveis iguais'
                    : playerStronger
                        ? `+${diff} de vantagem`
                        : `+${diff} de desvantagem`}
            </span>
            <span className="text-gray-300">·</span>
            <span>Nível {opponent.level}</span>
        </div>
    );
}
