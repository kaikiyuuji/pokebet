import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { getTypeStyle } from '@/lib/pokemon';
import { Trophy, Skull, Handshake, Coins, Swords, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

function ResultBadge({ result }) {
    const map = {
        win:  { label: 'Vitória', cls: 'bg-green-100 text-green-700 border-green-200',   Icon: Trophy    },
        loss: { label: 'Derrota', cls: 'bg-red-100 text-red-700 border-red-200',         Icon: Skull     },
        draw: { label: 'Empate',  cls: 'bg-yellow-100 text-yellow-700 border-yellow-200', Icon: Handshake },
    };
    const { label, cls, Icon } = map[result] ?? { label: result, cls: 'bg-gray-100 text-gray-600 border-gray-200', Icon: Swords };
    return (
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
            <Icon className="w-3 h-3" /> {label}
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
                style={{ imageRendering: 'pixelated' }}
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
    const ResultIcon = { win: Trophy, loss: Skull, draw: Handshake }[battle.result] ?? Swords;
    const isLoss = battle.result === 'loss';

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-[140px]">
                    <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Seu Pokémon</p>
                    <PokemonCell side={battle.player} />
                </div>

                <div className="flex flex-col items-center gap-1 px-2">
                    <ResultIcon className={`w-7 h-7 ${
                        battle.result === 'win'  ? 'text-yellow-500' :
                        battle.result === 'loss' ? 'text-red-500' : 'text-gray-400'
                    }`} />
                    <ResultBadge result={battle.result} />
                </div>

                <div className="flex-1 min-w-[140px]">
                    <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Oponente</p>
                    <PokemonCell side={battle.opponent} />
                </div>

                <div className="flex flex-col items-end gap-1 ml-auto">
                    <div className={`flex items-center gap-1 text-sm font-semibold ${isLoss ? 'text-red-500' : 'text-yellow-600'}`}>
                        <Coins className="w-4 h-4" />
                        <span>{isLoss ? '-' : '+'}{battle.coins_awarded}</span>
                    </div>
                    <p className="text-xs text-gray-400">{battle.created_at}</p>
                    <Link
                        href={route('battles.log', battle.id)}
                        className="mt-1 flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                        Ver log <ArrowRight className="w-3 h-3" />
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
                            ? 'bg-red-600 text-white border-red-600'
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
                    <h2 className="text-xl font-bold text-white">Histórico de Batalhas</h2>
                    <Link
                        href={route('battle.new')}
                        className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                    >
                        <Swords className="w-4 h-4" /> Nova Batalha
                    </Link>
                </div>
            }
        >
            <Head title="Histórico de Batalhas" />

            <div className="py-8 px-4">
                <div className="mx-auto max-w-4xl space-y-4">
                    {battles.data.length === 0 ? (
                        <div className="text-center py-20">
                            <Swords className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400 text-lg font-medium">Nenhuma batalha ainda</p>
                            <p className="text-slate-500 text-sm mt-1">Inicie sua primeira batalha para ver o histórico aqui.</p>
                            <Link
                                href={route('battle.new')}
                                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700"
                            >
                                <Swords className="w-4 h-4" /> Começar agora
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
