import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatPokedexNumber, getTypeStyle } from '@/lib/pokemon';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { Search, Swords, Check, X, Sparkles } from 'lucide-react';

function TypeBadge({ type, size = 'sm' }) {
    if (!type) return null;
    const { bg, text } = getTypeStyle(type.slug);
    const cls = size === 'xs'
        ? `${bg} ${text} rounded px-1.5 py-0.5 text-[10px] font-bold uppercase`
        : `${bg} ${text} rounded px-2 py-0.5 text-xs font-bold uppercase`;
    return <span className={cls}>{type.name}</span>;
}

function PokemonCard({ pokemon, selected, onSelect, index }) {
    const style = pokemon.primary_type ? getTypeStyle(pokemon.primary_type.slug) : getTypeStyle('normal');

    return (
        <button
            type="button"
            onClick={() => onSelect(pokemon)}
            className={`
                poke-card pokemon-card hover-lift group flex min-h-[168px] flex-col items-center gap-2 p-3 text-center
                ${selected ? `ring-2 ring-offset-2 ${style.ring}` : ''}
            `}
            style={{ '--card-index': index }}
        >
            <span className={`absolute inset-x-0 top-0 h-2 ${style.bg}`} />

            {selected && (
                <span className="absolute right-2 top-3 flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-900 bg-yellow-300 text-slate-900 shadow-[2px_2px_0_#1d2a44] animate-pop">
                    <Check className="h-3.5 w-3.5" />
                </span>
            )}

            <span className="mt-2 font-mono text-xs font-bold text-app-soft">
                {formatPokedexNumber(pokemon.pokeapi_id)}
            </span>

            <div className="relative flex h-20 w-20 items-center justify-center rounded border border-app bg-[var(--surface-strong)]">
                <div className="absolute inset-x-3 bottom-2 h-2 rounded bg-black/10" />
                <img
                    src={pokemon.sprite ?? pokemon.sprite_front ?? '/images/pokemon-placeholder.png'}
                    alt={pokemon.name}
                    className="relative h-full w-full object-contain drop-shadow-md transition-transform duration-200 group-hover:-translate-y-1 group-hover:scale-110"
                    style={{ imageRendering: 'pixelated' }}
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = '/images/pokemon-placeholder.png'; }}
                />
            </div>

            <p className="min-h-[20px] max-w-full text-sm font-black capitalize leading-tight text-app">
                {pokemon.name}
            </p>

            <div className="flex min-h-[20px] flex-wrap justify-center gap-1">
                <TypeBadge type={pokemon.primary_type} size="xs" />
                <TypeBadge type={pokemon.secondary_type} size="xs" />
            </div>
        </button>
    );
}

function Pagination({ links }) {
    return (
        <nav className="mt-6 flex flex-wrap justify-center gap-1">
            {links.map((link, i) => (
                link.url
                    ? <Link
                        key={i}
                        href={link.url}
                        preserveScroll
                        className={`rounded border px-3 py-1.5 text-sm font-bold transition-all hover:-translate-y-0.5 ${
                            link.active
                                ? 'border-red-700 bg-red-600 text-white'
                                : 'border-app bg-app-surface text-app-muted hover:text-app'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                    : <span
                        key={i}
                        className="rounded border border-app px-3 py-1.5 text-sm text-app-soft opacity-60"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
            ))}
        </nav>
    );
}

function SelectionBar({ selected, onClear, onStart, processing }) {
    if (!selected) return null;

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t-4 border-red-600 bg-app-surface shadow-2xl animate-fade-up">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex min-w-0 items-center gap-3">
                    <img
                        src={selected.sprite ?? selected.sprite_front ?? '/images/pokemon-placeholder.png'}
                        alt={selected.name}
                        className="h-12 w-12 shrink-0 object-contain"
                        style={{ imageRendering: 'pixelated' }}
                    />
                    <div className="min-w-0">
                        <p className="truncate font-black capitalize text-app">{selected.name}</p>
                        <div className="mt-0.5 flex gap-1">
                            <TypeBadge type={selected.primary_type} size="xs" />
                            <TypeBadge type={selected.secondary_type} size="xs" />
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                    <button
                        type="button"
                        onClick={onClear}
                        className="btn-quiet flex items-center gap-1 px-3 py-2 text-sm font-semibold"
                    >
                        <X className="h-4 w-4" /> Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onStart}
                        disabled={processing}
                        className="btn-poke flex items-center gap-2 px-4 py-2 text-sm font-bold disabled:opacity-50"
                    >
                        <Swords className="h-4 w-4" />
                        {processing ? 'Iniciando...' : 'Batalhar'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function SelectPokemon({ pokemons, types, filters }) {
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState(filters.search ?? '');
    const searchTimer = useRef(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (search === (filters.search ?? '')) return;

        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            router.get(
                route('battle.new'),
                { search: search || undefined, type: filters.type || undefined },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 350);

        return () => clearTimeout(searchTimer.current);
    }, [search]);

    const handleTypeFilter = (slug) => {
        router.get(
            route('battle.new'),
            { search: filters.search || undefined, type: slug || undefined },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleStart = () => {
        if (!selected || processing) return;
        setProcessing(true);
        router.post(route('battle.store'), { pokeapi_id: selected.pokeapi_id }, {
            onFinish: () => setProcessing(false),
        });
    };

    const isEmpty = pokemons.data.length === 0;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="flex items-center gap-2 text-xl font-black text-app">
                            <Swords className="h-5 w-5 text-red-500" /> Nova Batalha
                        </h2>
                        <p className="mt-0.5 text-sm text-app-muted">Escolha seu Pokémon</p>
                    </div>
                    <Sparkles className="hidden h-6 w-6 text-yellow-500 animate-soft-pulse sm:block" />
                </div>
            }
        >
            <Head title="Escolher Pokémon" />

            <div className={`py-6 ${selected ? 'pb-24' : ''}`}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-5 space-y-3 animate-fade-up">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-soft" />
                            <input
                                type="text"
                                placeholder="Buscar Pokémon..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-lg border border-app bg-app-surface py-2.5 pl-9 pr-4 text-sm text-app shadow-sm transition-colors placeholder:text-app-soft focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <TypeFilterButton
                                label="Todos"
                                active={!filters.type}
                                onClick={() => handleTypeFilter(null)}
                            />
                            {types.map((t) => (
                                <TypeFilterButton
                                    key={t.id}
                                    label={t.name}
                                    slug={t.slug}
                                    active={filters.type === t.slug}
                                    onClick={() => handleTypeFilter(t.slug)}
                                />
                            ))}
                        </div>
                    </div>

                    {!isEmpty && (
                        <p className="mb-3 text-xs font-semibold text-app-muted">
                            {pokemons.total} Pokémon encontrados | página {pokemons.current_page}/{pokemons.last_page}
                        </p>
                    )}

                    {isEmpty && (
                        <div className="poke-card mx-auto flex max-w-lg flex-col items-center justify-center px-6 py-16 text-center animate-pop">
                            <Search className="mb-4 h-14 w-14 text-app-soft" />
                            {pokemons.total === 0 && !filters.search ? (
                                <>
                                    <p className="text-lg font-black text-app">Não foi possível carregar os Pokémon</p>
                                    <p className="mt-1 text-sm text-app-muted">Verifique sua conexão com a internet e tente novamente.</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-lg font-black text-app">Nenhum resultado</p>
                                    <p className="mt-1 text-sm text-app-muted">Tente outro nome ou tipo.</p>
                                </>
                            )}
                        </div>
                    )}

                    {!isEmpty && (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8">
                            {pokemons.data.map((pokemon, index) => (
                                <PokemonCard
                                    key={pokemon.id}
                                    pokemon={pokemon}
                                    selected={selected?.id === pokemon.id}
                                    onSelect={setSelected}
                                    index={index}
                                />
                            ))}
                        </div>
                    )}

                    {pokemons.last_page > 1 && (
                        <Pagination links={pokemons.links} />
                    )}
                </div>
            </div>

            <SelectionBar
                selected={selected}
                onClear={() => setSelected(null)}
                onStart={handleStart}
                processing={processing}
            />
        </AuthenticatedLayout>
    );
}

function TypeFilterButton({ label, slug, active, onClick }) {
    const style = slug ? getTypeStyle(slug) : null;

    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-full border px-3 py-1 text-xs font-bold transition-all hover:-translate-y-0.5 ${
                active
                    ? style
                        ? `${style.bg} ${style.text} border-transparent shadow`
                        : 'border-red-700 bg-red-600 text-white shadow'
                    : 'border-app bg-app-surface text-app-muted hover:text-app'
            }`}
        >
            {label}
        </button>
    );
}
