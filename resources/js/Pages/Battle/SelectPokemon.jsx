import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatPokedexNumber, getTypeStyle } from '@/lib/pokemon';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { Search, Swords, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';

function TypeBadge({ type, size = 'sm' }) {
    if (!type) return null;
    const { bg, text } = getTypeStyle(type.slug);
    const cls = size === 'xs'
        ? `${bg} ${text} px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide`
        : `${bg} ${text} px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide`;
    return <span className={cls}>{type.name}</span>;
}

function PokemonCard({ pokemon, selected, onSelect }) {
    const { ring } = pokemon.primary_type ? getTypeStyle(pokemon.primary_type.slug) : { ring: 'ring-red-400' };

    return (
        <button
            type="button"
            onClick={() => onSelect(pokemon)}
            className={`
                group relative flex flex-col items-center gap-1 rounded-xl border-2 bg-white p-3 text-center
                transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 cursor-pointer
                ${selected
                    ? `border-red-500 shadow-lg shadow-red-100 ring-2 ${ring}`
                    : 'border-gray-100 hover:border-gray-300'
                }
            `}
        >
            {selected && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow">
                    <Check className="w-3 h-3" />
                </span>
            )}

            <span className="text-xs text-gray-400 font-mono">
                {formatPokedexNumber(pokemon.pokeapi_id)}
            </span>

            <div className="relative h-16 w-16 flex items-center justify-center">
                <img
                    src={pokemon.sprite ?? pokemon.sprite_front ?? '/images/pokemon-placeholder.png'}
                    alt={pokemon.name}
                    className="h-full w-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-150"
                    style={{ imageRendering: 'pixelated' }}
                    loading="lazy"
                    onError={(e) => { e.target.src = '/images/pokemon-placeholder.png'; }}
                />
            </div>

            <p className="text-sm font-semibold text-gray-800 leading-tight capitalize">{pokemon.name}</p>

            <div className="flex gap-1 flex-wrap justify-center">
                <TypeBadge type={pokemon.primary_type} size="xs" />
                <TypeBadge type={pokemon.secondary_type} size="xs" />
            </div>

            <p className="text-xs text-gray-400 mt-0.5">
                Total: <span className="font-semibold text-gray-600">{pokemon.base_total}</span>
            </p>
        </button>
    );
}

function Pagination({ links }) {
    return (
        <nav className="flex flex-wrap justify-center gap-1 mt-6">
            {links.map((link, i) => (
                link.url
                    ? <Link
                        key={i}
                        href={link.url}
                        preserveScroll
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                            link.active
                                ? 'bg-red-600 text-white'
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                    : <span
                        key={i}
                        className="px-3 py-1.5 rounded text-sm text-gray-300"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
            ))}
        </nav>
    );
}

function SelectionBar({ selected, onClear, onStart, processing }) {
    if (!selected) return null;

    return (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-white border-t-4 border-red-600 shadow-2xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <img
                        src={selected.sprite ?? selected.sprite_front ?? '/images/pokemon-placeholder.png'}
                        alt={selected.name}
                        className="h-12 w-12 object-contain"
                        style={{ imageRendering: 'pixelated' }}
                    />
                    <div>
                        <p className="font-semibold text-gray-800 capitalize">{selected.name}</p>
                        <div className="flex gap-1 mt-0.5">
                            <TypeBadge type={selected.primary_type} size="xs" />
                            <TypeBadge type={selected.secondary_type} size="xs" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onClear}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-4 h-4" /> Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onStart}
                        disabled={processing}
                        className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors shadow"
                    >
                        <Swords className="w-4 h-4" />
                        {processing ? 'Iniciando...' : 'Iniciar Batalha'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function SelectPokemon({ pokemons, types, filters }) {
    const [selected, setSelected]   = useState(null);
    const [search, setSearch]       = useState(filters.search ?? '');
    const searchTimer               = useRef(null);
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
                <div>
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Swords className="w-5 h-5 text-red-400" /> Nova Batalha
                    </h2>
                    <p className="text-sm text-slate-400 mt-0.5">Escolha seu Pokémon</p>
                </div>
            }
        >
            <Head title="Escolher Pokémon" />

            <div className={`py-6 ${selected ? 'pb-24' : ''}`}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    {/* Search + Type Filters */}
                    <div className="mb-5 space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar Pokémon..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-2.5 text-sm shadow-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
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
                        <p className="text-xs text-slate-500 mb-3">
                            {pokemons.total} Pokémon encontrados — página {pokemons.current_page}/{pokemons.last_page}
                        </p>
                    )}

                    {isEmpty && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <Search className="w-16 h-16 text-slate-600 mb-4" />
                            {pokemons.total === 0 && !filters.search ? (
                                <>
                                    <p className="text-lg font-semibold text-slate-300">Não foi possível carregar os Pokémon</p>
                                    <p className="text-sm text-slate-500 mt-1">Verifique sua conexão com a internet e tente novamente.</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-lg font-semibold text-slate-300">Nenhum resultado</p>
                                    <p className="text-sm text-slate-500 mt-1">Tente outro nome ou tipo</p>
                                </>
                            )}
                        </div>
                    )}

                    {!isEmpty && (
                        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                            {pokemons.data.map((pokemon) => (
                                <PokemonCard
                                    key={pokemon.id}
                                    pokemon={pokemon}
                                    selected={selected?.id === pokemon.id}
                                    onSelect={setSelected}
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
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                active
                    ? style
                        ? `${style.bg} ${style.text} shadow`
                        : 'bg-red-600 text-white shadow'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
        >
            {label}
        </button>
    );
}
