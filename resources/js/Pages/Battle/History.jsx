import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { getTypeStyle } from '@/lib/pokemon';
import { Trophy, Skull, Handshake, Coins, Swords, ArrowRight } from 'lucide-react';

function ResultBadge({ result }) {
    const map = {
        win: { label: 'Vitória', cls: 'bg-green-100 text-green-700 border-green-300', Icon: Trophy },
        loss: { label: 'Derrota', cls: 'bg-red-100 text-red-700 border-red-300', Icon: Skull },
        draw: { label: 'Empate', cls: 'bg-yellow-100 text-yellow-700 border-yellow-300', Icon: Handshake },
    };
    const { label, cls, Icon } = map[result] ?? { label: result, cls: 'bg-slate-100 text-slate-600 border-slate-300', Icon: Swords };
    return (
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${cls}`}>
            <Icon className="h-3 w-3" /> {label}
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

function PokemonCell({ side, align = 'left' }) {
    return (
        <div className={`flex min-w-0 items-center gap-3 ${align === 'right' ? 'sm:flex-row-reverse sm:text-right' : ''}`}>
            <img
                src={side.pokemon.sprite}
                alt={side.pokemon.name}
                className="h-14 w-14 shrink-0 object-contain transition-transform duration-200 group-hover:-translate-y-1"
                style={{ imageRendering: 'pixelated' }}
            />
            <div className="min-w-0">
                <p className="truncate font-black capitalize text-app">{side.pokemon.name}</p>
                <div className={`mt-1 flex items-center gap-1 ${align === 'right' ? 'sm:justify-end' : ''}`}>
                    <TypeBadge type={side.pokemon.primary_type} />
                    <span className="text-xs font-semibold text-app-soft">Nv. {side.level}</span>
                </div>
            </div>
        </div>
    );
}

function BattleRow({ battle, index }) {
    const ResultIcon = { win: Trophy, loss: Skull, draw: Handshake }[battle.result] ?? Swords;
    const isLoss = battle.result === 'loss';

    return (
        <div className="poke-card hover-lift group animate-fade-up p-4" style={{ animationDelay: `${index * 70}ms` }}>
            <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr_auto]">
                <div>
                    <p className="mb-1 text-[10px] font-bold uppercase text-app-soft">Seu Pokémon</p>
                    <PokemonCell side={battle.player} />
                </div>

                <div className="flex items-center justify-center gap-2 md:flex-col">
                    <ResultIcon className={`h-7 w-7 ${
                        battle.result === 'win' ? 'text-yellow-500' :
                        battle.result === 'loss' ? 'text-red-500' : 'text-app-soft'
                    }`} />
                    <ResultBadge result={battle.result} />
                </div>

                <div>
                    <p className="mb-1 text-[10px] font-bold uppercase text-app-soft md:text-right">Oponente</p>
                    <PokemonCell side={battle.opponent} align="right" />
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-app pt-3 md:flex-col md:items-end md:border-t-0 md:pt-0">
                    <div className={`flex items-center gap-1 text-sm font-black ${isLoss ? 'text-red-500' : 'text-yellow-600'}`}>
                        <Coins className="h-4 w-4" />
                        <span>{isLoss ? '-' : '+'}{battle.coins_awarded}</span>
                    </div>
                    <p className="text-xs text-app-soft">{battle.created_at}</p>
                    <Link
                        href={route('battles.log', battle.id)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-red-600 transition-colors hover:text-red-800"
                    >
                        Ver log <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

function Pagination({ links }) {
    return (
        <div className="flex flex-wrap items-center justify-center gap-1">
            {links.map((link, i) => (
                <button
                    key={i}
                    type="button"
                    disabled={!link.url}
                    onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                    className={[
                        'rounded border px-3 py-1.5 text-sm font-bold transition-all',
                        link.active
                            ? 'border-red-700 bg-red-600 text-white'
                            : link.url
                                ? 'border-app bg-app-surface text-app-muted hover:-translate-y-0.5 hover:text-app'
                                : 'cursor-not-allowed border-app bg-[var(--surface-muted)] text-app-soft opacity-60',
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
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-black text-app">Histórico de Batalhas</h2>
                    <Link
                        href={route('battle.new')}
                        className="btn-poke flex items-center gap-2 px-4 py-2 text-sm font-bold"
                    >
                        <Swords className="h-4 w-4" /> Nova Batalha
                    </Link>
                </div>
            }
        >
            <Head title="Histórico de Batalhas" />

            <div className="px-4 py-8">
                <div className="mx-auto max-w-5xl space-y-4">
                    {battles.data.length === 0 ? (
                        <div className="poke-card mx-auto max-w-lg px-6 py-16 text-center animate-pop">
                            <Swords className="mx-auto mb-4 h-14 w-14 text-app-soft" />
                            <p className="text-lg font-black text-app">Nenhuma batalha ainda</p>
                            <p className="mt-1 text-sm text-app-muted">Inicie sua primeira batalha para ver o histórico aqui.</p>
                            <Link
                                href={route('battle.new')}
                                className="btn-poke mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm font-bold"
                            >
                                <Swords className="h-4 w-4" /> Começar agora
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {battles.data.map((b, index) => (
                                    <BattleRow key={b.id} battle={b} index={index} />
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
