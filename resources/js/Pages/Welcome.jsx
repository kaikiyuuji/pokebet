import { useThemeMode } from '@/hooks/useThemeMode';
import { Head, Link } from '@inertiajs/react';
import { Moon, Sun, Swords, Trophy, Zap, ScrollText } from 'lucide-react';

const heroPokemon = [
    {
        name: 'Pikachu',
        src: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
        className: 'right-12 bottom-12 h-56 w-56 sm:h-72 sm:w-72',
    },
    {
        name: 'Charizard',
        src: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
        className: 'right-44 top-24 hidden h-48 w-48 opacity-80 lg:block',
    },
    {
        name: 'Blastoise',
        src: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png',
        className: 'right-72 bottom-6 hidden h-44 w-44 opacity-80 xl:block',
    },
];

function Feature({ Icon, title, text }) {
    return (
        <div className="poke-card hover-lift p-4">
            <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded border-2 border-red-800 bg-red-100 text-red-600">
                    <Icon className="h-5 w-5" />
                </span>
                <div>
                    <p className="font-black text-app">{title}</p>
                    <p className="mt-1 text-sm text-app-muted">{text}</p>
                </div>
            </div>
        </div>
    );
}

export default function Welcome({ auth }) {
    const { isDark, toggleTheme } = useThemeMode();

    return (
        <>
            <Head title="PokéBet" />
            <div className="app-shell relative min-h-screen overflow-hidden">
                {heroPokemon.map((pokemon) => (
                    <img
                        key={pokemon.name}
                        src={pokemon.src}
                        alt={pokemon.name}
                        className={`pointer-events-none absolute object-contain drop-shadow-2xl ${pokemon.className}`}
                        loading="eager"
                    />
                ))}

                <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
                    <Link href="/" className="group flex items-center gap-2">
                        <span className="flex h-10 w-10 items-center justify-center rounded border-2 border-slate-900 bg-yellow-300 text-red-700 shadow-[3px_3px_0_#1d2a44] transition-transform group-hover:-rotate-6 group-hover:scale-105">
                            <Zap className="h-6 w-6 fill-current" />
                        </span>
                        <span className="font-pixel text-sm text-app">PokéBet</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="btn-quiet flex h-10 w-10 items-center justify-center"
                            aria-label={isDark ? 'Usar tema claro' : 'Usar tema escuro'}
                        >
                            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </button>
                        {auth.user ? (
                            <Link href={route('dashboard')} className="btn-poke px-4 py-2 text-sm font-bold">
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="btn-quiet px-4 py-2 text-sm font-bold">
                                    Entrar
                                </Link>
                                <Link href={route('register')} className="btn-poke px-4 py-2 text-sm font-bold">
                                    Criar conta
                                </Link>
                            </>
                        )}
                    </div>
                </header>

                <main className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] max-w-7xl flex-col justify-center px-4 pb-10 sm:px-6 lg:px-8">
                    <section className="max-w-2xl animate-fade-up py-16">
                        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-app bg-app-surface px-3 py-1 text-xs font-bold text-app-muted">
                            <Swords className="h-3.5 w-3.5 text-red-500" />
                            Simulador de batalhas Pokémon
                        </p>
                        <h1 className="text-4xl font-black leading-tight text-app sm:text-6xl">
                            PokéBet
                        </h1>
                        <p className="mt-4 max-w-xl text-base text-app-muted sm:text-lg">
                            Escolha seu Pokémon, simule batalhas e acompanhe recompensas em uma interface inspirada nos clássicos jogos da série.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href={auth.user ? route('battle.new') : route('register')}
                                className="btn-poke inline-flex items-center gap-2 px-6 py-3 text-sm font-bold"
                            >
                                <Swords className="h-4 w-4" />
                                {auth.user ? 'Nova batalha' : 'Começar'}
                            </Link>
                            <Link
                                href={auth.user ? route('battles.index') : route('login')}
                                className="btn-quiet inline-flex items-center gap-2 px-6 py-3 text-sm font-bold"
                            >
                                <ScrollText className="h-4 w-4" />
                                {auth.user ? 'Histórico' : 'Já tenho conta'}
                            </Link>
                        </div>
                    </section>

                    <section className="grid gap-4 sm:grid-cols-3">
                        <Feature Icon={Swords} title="Batalhas rápidas" text="Escolha um Pokémon e veja os turnos se desenrolarem." />
                        <Feature Icon={Trophy} title="Resultados claros" text="Vitória, derrota, dano e moedas aparecem sem ruído." />
                        <Feature Icon={ScrollText} title="Histórico completo" text="Revise logs e melhores golpes depois de cada batalha." />
                    </section>
                </main>
            </div>
        </>
    );
}
