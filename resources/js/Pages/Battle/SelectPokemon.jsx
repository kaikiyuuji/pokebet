import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { sound } from '@/hooks/useSound';
import { formatPokedexNumber, getTypeStyle } from '@/lib/pokemon';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Swords, Check, X, RefreshCw, Coins } from 'lucide-react';

const ROULETTE_FALLBACK = [
    { pokeapi_id: 25, name: 'Pikachu', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png' },
    { pokeapi_id: 6, name: 'Charizard', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png' },
    { pokeapi_id: 9, name: 'Blastoise', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png' },
    { pokeapi_id: 3, name: 'Venusaur', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png' },
    { pokeapi_id: 94, name: 'Gengar', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png' },
    { pokeapi_id: 149, name: 'Dragonite', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png' },
];

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
                poke-card pokemon-card hover-lift group flex min-h-[232px] flex-col items-center gap-2 p-3 text-center
                ${selected ? `ring-2 ring-offset-2 ${style.ring}` : ''}
            `}
            style={{ '--card-index': index }}
        >
            <span className={`absolute inset-x-0 top-0 h-1 ${style.bg}`} />

            {selected && (
                <span className="absolute right-2 top-3 flex h-7 w-7 items-center justify-center border border-[var(--ink)] bg-[var(--coin)] text-slate-900 shadow-[3px_3px_0_var(--ink)] animate-pop">
                    <Check className="h-3.5 w-3.5" />
                </span>
            )}

            <span className="technical-label mt-2 self-start text-[var(--accent)]">
                {formatPokedexNumber(pokemon.pokeapi_id)}
            </span>

            <div className="dot-field relative flex h-32 w-full items-center justify-center border border-app">
                <div className="absolute inset-x-5 bottom-3 h-px bg-[var(--line-strong)]" />
                <img
                    src={pokemon.sprite ?? pokemon.sprite_front ?? '/images/pokemon-placeholder.png'}
                    alt={pokemon.name}
                    className="relative h-full w-full object-contain drop-shadow-md transition-transform duration-200 group-hover:-translate-y-1 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = '/images/pokemon-placeholder.png'; }}
                />
            </div>

            <p className="min-h-[20px] max-w-full text-base font-semibold capitalize leading-tight tracking-[-0.03em] text-app">
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
                        className={`border px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider transition-all hover:-translate-y-0.5 ${
                            link.active
                                ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                                : 'border-app bg-app-surface text-app-muted hover:text-app'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                    : <span
                        key={i}
                        className="border border-app px-3 py-2 font-mono text-[10px] text-app-soft opacity-60"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
            ))}
        </nav>
    );
}

function SelectionBar({ selected, onClear, onStart, processing }) {
    if (!selected) return null;

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--ink)] bg-app-surface shadow-[0_-8px_30px_rgba(0,0,0,0.12)] animate-fade-up">
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
                        disabled={processing}
                        className="btn-quiet flex items-center gap-1 px-3 py-2 text-sm font-semibold disabled:opacity-50"
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

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function OpponentRoulette({ show, selected, candidates, phase, onBetConfirm, onCancel, userCoins, processing }) {
    const [betInput, setBetInput] = useState('');

    useEffect(() => {
        if (!show || phase !== 'spinning') return undefined;

        let timer = null;
        let tick = 0;
        let elapsed = 0;

        const playTick = () => {
            sound.rouletteTick(tick);
            tick += 1;

            const progress = Math.min(tick / 22, 1);
            const interval = 36 + (progress ** 2) * 128;
            elapsed += interval;

            if (elapsed < 1540) {
                timer = window.setTimeout(playTick, interval);
            }
        };

        playTick();
        return () => window.clearTimeout(timer);
    }, [show, phase]);

    if (!show || !selected) return null;

    const entries = candidates.length > 0 ? candidates : ROULETTE_FALLBACK;
    const reel = [...entries, ...entries];
    const betting = phase === 'betting';

    const betValue = parseInt(betInput, 10) || 0;
    const canBet = betValue >= 10 && betValue <= userCoins && !processing;

    const setPreset = (pct) => {
        const amount = pct === 1 ? userCoins : Math.max(10, Math.floor(userCoins * pct));
        setBetInput(String(amount));
    };

    const profit = Math.floor(betValue * 0.8);

    if (betting) {
        return (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
                <div className="poke-card w-full max-w-sm p-5 animate-pop">
                    <div className="mb-4 flex items-center gap-3 border border-[var(--ink)] bg-[var(--surface-strong)] p-3">
                        <img
                            src={selected.sprite ?? selected.sprite_front ?? '/images/pokemon-placeholder.png'}
                            alt={selected.name}
                            className="h-16 w-16 shrink-0 object-contain drop-shadow-md"
                        />
                        <div>
                            <p className="font-black capitalize text-app">{selected.name}</p>
                            <div className="mt-1 flex flex-wrap gap-1">
                                <TypeBadge type={selected.primary_type} size="xs" />
                                <TypeBadge type={selected.secondary_type} size="xs" />
                            </div>
                            <p className="mt-1 text-xs text-app-soft">pronto para a batalha</p>
                        </div>
                    </div>

                    <p className="font-black text-app">Quanto quer apostar?</p>
                    <p className="mt-0.5 text-xs text-app-muted">
                        O adversário é sorteado só depois da aposta.
                    </p>
                    <p className="mt-0.5 text-xs text-app-muted">
                        Saldo: <span className="font-bold text-[var(--coin)]">{userCoins.toLocaleString('pt-BR')}</span> moedas
                    </p>

                    <div className="mt-3 flex gap-1.5">
                        {[0.25, 0.5, 0.75, 1].map((pct) => (
                            <button
                                key={pct}
                                type="button"
                                onClick={() => setPreset(pct)}
                                disabled={userCoins < 10}
                                className="btn-quiet flex-1 py-1 text-xs font-bold disabled:opacity-40"
                            >
                                {pct === 1 ? 'MAX' : `${pct * 100}%`}
                            </button>
                        ))}
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                        <Coins className="h-5 w-5 shrink-0 text-[var(--coin)]" />
                        <input
                            type="number"
                            min="10"
                            max={userCoins}
                            value={betInput}
                            onChange={(e) => setBetInput(e.target.value)}
                            placeholder="Mínimo 10"
                            className="flex-1 border border-app bg-app-surface px-3 py-2 text-center text-lg font-black text-app focus:border-[var(--accent)] focus:outline-none focus:ring-0"
                        />
                    </div>

                    {betValue >= 10 && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            <div className="rounded border border-app bg-[var(--surface-strong)] p-2 text-center">
                                <p className="text-xs font-semibold text-green-600">Vitória</p>
                                <p className="text-sm font-black text-green-600">+{profit.toLocaleString('pt-BR')}</p>
                            </div>
                            <div className="rounded border border-app bg-[var(--surface-strong)] p-2 text-center">
                                <p className="text-xs font-semibold text-red-500">Derrota</p>
                                <p className="text-sm font-black text-red-500">-{betValue.toLocaleString('pt-BR')}</p>
                            </div>
                        </div>
                    )}

                    {betValue > 0 && !canBet && (
                        <p className="mt-2 text-xs text-red-500">
                            {betValue > userCoins ? 'Saldo insuficiente' : betValue < 10 ? 'Mínimo 10 moedas' : ''}
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={() => onBetConfirm(betValue)}
                        disabled={!canBet}
                        className="btn-poke mt-4 flex w-full items-center justify-center gap-2 py-3 font-bold disabled:opacity-50"
                    >
                        <Swords className="h-4 w-4" />
                        {processing ? 'Iniciando...' : 'Apostar e Batalhar'}
                    </button>

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={processing}
                        className="btn-quiet mt-2 w-full py-2 text-sm font-semibold disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
            <div className="poke-card w-full max-w-xl p-5 text-center animate-pop">
                <div className="roulette-status-mark mb-5">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                </div>
                <p className="font-pixel text-[11px] text-app">
                    Sorteando adversário
                </p>
                <p className="mt-2 text-sm text-app-muted">
                    {`${selected.name} está procurando o próximo desafio.`}
                </p>

                {(
                    <div className="roulette-window dot-field relative mt-5 overflow-hidden border border-[var(--ink)] py-3">
                        <div className="roulette-marker pointer-events-none" />
                        <div className="roulette-track flex w-max gap-3 px-3">
                            {reel.map((pokemon, index) => (
                                <div
                                    key={`${pokemon.pokeapi_id}-${index}`}
                                    className="roulette-slot flex h-28 w-24 shrink-0 flex-col items-center justify-center border border-app bg-app-surface p-2"
                                >
                                    <img
                                        src={pokemon.sprite ?? pokemon.sprite_front ?? '/images/pokemon-placeholder.png'}
                                        alt={pokemon.name}
                                        className="h-16 w-16 object-contain drop-shadow-md"
                                    />
                                    <span className="mt-1 max-w-full truncate text-xs font-black capitalize text-app">
                                        {pokemon.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SelectPokemon({ pokemons, types, filters }) {
    const { auth } = usePage().props;
    const userCoins = auth.user.coins;

    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState(filters.search ?? '');
    const searchTimer = useRef(null);
    const [processing, setProcessing] = useState(false);
    const [showRoulette, setShowRoulette] = useState(false);
    const [roulettePhase, setRoulettePhase] = useState('betting');

    const rouletteCandidates = useMemo(() => {
        const pageCandidates = pokemons.data
            .filter((pokemon) => pokemon.pokeapi_id !== selected?.pokeapi_id)
            .slice(0, 10);

        return pageCandidates.length >= 4 ? pageCandidates : ROULETTE_FALLBACK;
    }, [pokemons.data, selected]);

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
        setRoulettePhase('betting');
        setShowRoulette(true);
    };

    const handleBetConfirm = async (betAmount) => {
        if (processing) return;
        setProcessing(true);

        // Roleta apenas cosmética: o adversário real é sorteado no servidor.
        setRoulettePhase('spinning');
        await sleep(1800);

        router.post(
            route('battle.store'),
            {
                pokeapi_id: selected.pokeapi_id,
                bet_amount: betAmount,
            },
            {
                onError: () => {
                    setProcessing(false);
                    setRoulettePhase('betting');
                },
                onFinish: () => {
                    setProcessing(false);
                },
            }
        );
    };

    const handleRouletteCancel = () => {
        setShowRoulette(false);
        setRoulettePhase('betting');
        setProcessing(false);
    };

    const isEmpty = pokemons.data.length === 0;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <p className="technical-label text-[var(--accent)]">02 / Protocolo de seleção</p>
                        <h1 className="mt-3 text-4xl font-medium tracking-[-0.06em] text-app">Escolha seu Pokémon.</h1>
                        <p className="mt-2 text-sm text-app-muted">O primeiro passo antes do sorteio e da aposta.</p>
                    </div>
                    <Swords className="hidden h-8 w-8 text-[var(--accent)] sm:block" />
                </div>
            }
        >
            <Head title="Escolher Pokémon" />

            <div className={`${selected ? 'pb-24' : ''}`}>
                <div className="app-frame px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                    <div className="dot-field mb-7 grid gap-4 border border-[var(--line)] p-4 animate-fade-up lg:grid-cols-[1fr_auto] lg:items-end">
                        <label className="relative block">
                            <span className="technical-label mb-2 block text-[var(--accent)]">Pesquisar no catálogo</span>
                            <Search className="absolute left-3 top-[calc(50%+0.65rem)] h-4 w-4 -translate-y-1/2 text-app-soft" />
                            <input
                                type="text"
                                placeholder="Buscar Pokémon..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="min-h-12 w-full border border-app bg-app-surface py-2.5 pl-9 pr-4 text-sm text-app transition-colors placeholder:text-app-soft focus:border-[var(--accent)] focus:outline-none focus:ring-0"
                            />
                        </label>

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
                        <p className="technical-label mb-4">
                            {pokemons.total} Pokémon encontrados / página {pokemons.current_page} de {pokemons.last_page}
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
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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

            <OpponentRoulette
                show={showRoulette}
                selected={selected}
                candidates={rouletteCandidates}
                phase={roulettePhase}
                onBetConfirm={handleBetConfirm}
                onCancel={handleRouletteCancel}
                userCoins={userCoins}
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
            className={`border px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-wider transition-all hover:-translate-y-0.5 ${
                active
                    ? style
                        ? `${style.bg} ${style.text} border-transparent shadow`
                        : 'border-[var(--accent)] bg-[var(--accent)] text-white'
                    : 'border-app bg-app-surface text-app-muted hover:text-app'
            }`}
        >
            {label}
        </button>
    );
}
