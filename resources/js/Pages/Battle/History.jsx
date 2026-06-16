import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { getTypeStyle } from '@/lib/pokemon';

function ResultBadge({ result }) {
    const map = {
        win:  { label: 'Vitória',  cls: 'bg-green-100 text-green-700 border-green-200' },
        loss: { label: 'Derrota',  cls: 'bg-red-100 text-red-700 border-red-200' },
        draw: { label: 'Empate',   cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    };
    const { label, cls } = map[result] ?? { label: result, cls: 'bg-gray-100 text-gray-600 border-gray-200' };
    return (
        <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
            {label}
        </span>
    );
}

function TypeBadge({ type }) {
    if (!type) return null;
    const { bg, text } = getTypeStyle(type.slug);
    return (
        <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${bg} ${text}`}>
            {type.name}
        </span>
    );
}

function PokemonCell({ side }) {
    return (
        <div className="flex items-center gap-3 min-w-0">
            <img
                src={side.pokemon.sprite}
                alt={side.pokemon.name}
                className="w-12 h-12 object-contain shrink-0"
            />
            <div className="min-w-0">
                <p className="font-semibold text-gray-800 capitalize truncate">{side.pokemon.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                    <TypeBadge type={side.pokemon.primary_type} />
                    <span className="text-xs text-gray-400">Nv. {side.level}</span>
                </div>
            </div>
        </div>
    );
}

function BattleRow({ battle }) {
    const resultIcon = { win: '🏆', loss: '💀', draw: '🤝' }[battle.result] ?? '❓';

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 flex items-center gap-4 flex-wrap">
                {/* Player */}
                <div className="flex-1 min-w-[140px]">
                    <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Seu Pokémon</p>
                    <PokemonCell side={battle.player} />
                </div>

                {/* VS */}
                <div className="flex flex-col items-center gap-1 px-2">
                    <span className="text-2xl">{resultIcon}</span>
                    <ResultBadge result={battle.result} />
                </div>

                {/* Opponent */}
                <div className="flex-1 min-w-[140px]">
                    <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Oponente</p>
                    <PokemonCell side={battle.opponent} />
                </div>

                {/* Meta */}
                <div className="flex flex-col items-end gap-1 ml-auto">
                    <div className="flex items-center gap-1 text-sm font-semibold text-yellow-600">
                        <span>🪙</span>
                        <span>+{battle.coins_awarded}</span>
                    </div>
                    <p className="text-xs text-gray-400">{battle.created_at}</p>
                    <Link
                        href={route('battles.log', battle.id)}
                        className="mt-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                        Ver log →
                    </Link>
                </div>
            </div>
        </div>
    );
}

function Pagination({ links }) {
    return (
        <div className="flex items-center justify-center gap-1 flex-wrap">
            {links.map((link, i) => (
                <button
                    key={i}
                    disabled={!link.url}
                    onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                    className={[
                        'px-3 py-1.5 rounded text-sm font-medium border transition-colors',
                        link.active
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : link.url
                                ? 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed',
                    ].join(' ')}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}
        </div>
    );
}

export default function History({ battles }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">📜 Histórico de Batalhas</h2>
                    <Link
                        href={route('battle.new')}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
                    >
                        ⚔️ Nova Batalha
                    </Link>
                </div>
            }
        >
            <Head title="Histórico de Batalhas" />

            <div className="py-8 px-4">
                <div className="mx-auto max-w-4xl space-y-4">
                    {battles.data.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-5xl mb-4">⚔️</p>
                            <p className="text-gray-500 text-lg font-medium">Nenhuma batalha ainda</p>
                            <p className="text-gray-400 text-sm mt-1">Inicie sua primeira batalha para ver o histórico aqui.</p>
                            <Link
                                href={route('battle.new')}
                                className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                            >
                                Começar agora
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {battles.data.map((b) => (
                                    <BattleRow key={b.id} battle={b} />
                                ))}
                            </div>

                            {battles.links.length > 3 && (
                                <div className="pt-4">
                                    <Pagination links={battles.links} />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
