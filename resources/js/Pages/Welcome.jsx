import BrandMark from '@/Components/BrandMark';
import SoundToggle from '@/Components/SoundToggle';
import { useThemeMode } from '@/hooks/useThemeMode';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    Coins,
    Moon,
    ScrollText,
    ShieldCheck,
    Sun,
    Swords,
} from 'lucide-react';

const protocolItems = [
    { index: '01', Icon: Swords, title: 'Escolha', text: 'Selecione um Pokémon no catálogo.' },
    { index: '02', Icon: Coins, title: 'Aposte', text: 'Defina o risco antes do confronto.' },
    { index: '03', Icon: ScrollText, title: 'Revise', text: 'Acompanhe replay, dano e turnos.' },
];

function ProtocolItem({ index, Icon, title, text }) {
    return (
        <article className="group grid gap-5 border-b border-[var(--line)] p-5 transition-colors last:border-b-0 hover:bg-[var(--paper)] sm:grid-cols-[46px_1fr]">
            <span className="font-mono text-xs font-bold text-[var(--accent)]">{index}</span>
            <div>
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-[var(--accent)]" />
                    <h3 className="font-semibold tracking-[-0.02em] text-app">{title}</h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-app-muted">{text}</p>
            </div>
        </article>
    );
}

export default function Welcome({ auth }) {
    const { isDark, toggleTheme } = useThemeMode();
    const isAuthenticated = Boolean(auth?.user);

    return (
        <>
            <Head title="PokéBet — Battle Lab" />

            <div className="app-shell min-h-screen">
                <header className="poke-topbar">
                    <div className="app-frame flex min-h-[72px] items-center justify-between px-4 sm:px-6 lg:px-8">
                        <BrandMark />

                        <div className="flex items-center gap-2">
                            <span className="system-status hidden sm:inline-flex">Sistema online</span>
                            <SoundToggle className="h-10 w-10" />
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="theme-toggle h-10 w-10"
                                aria-label={isDark ? 'Usar tema claro' : 'Usar tema escuro'}
                            >
                                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </button>

                            {isAuthenticated ? (
                                <Link href={route('dashboard')} className="btn-poke inline-flex items-center gap-2 px-4">
                                    Dashboard <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')} className="btn-quiet inline-flex items-center hidden px-4 sm:inline-flex">
                                        Entrar
                                    </Link>
                                    <Link href={route('register')} className="btn-poke inline-flex items-center gap-2 px-4">
                                        Criar conta <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <main>
                    <section className="app-frame grid min-h-[650px] lg:grid-cols-[1.42fr_0.78fr]">
                        <div className="flex flex-col justify-center border-b border-[var(--line)] px-4 py-16 sm:px-8 lg:border-b-0 lg:border-r lg:px-12 lg:py-24">
                            <p className="technical-label text-[var(--accent)]">01 / Simulador de batalha</p>
                            <h1 className="display-heading mt-7 max-w-5xl">
                                Escolha seu Pokémon e entre na aposta.
                            </h1>
                            <p className="mt-8 max-w-2xl text-base leading-8 text-app-muted sm:text-lg">
                                Escolha seu combatente, defina a aposta e acompanhe cada turno em uma interface feita para jogar sem perder os dados de vista.
                            </p>

                            <div className="mt-10 flex flex-wrap gap-3">
                                <Link
                                    href={isAuthenticated ? route('battle.new') : route('register')}
                                    className="btn-poke inline-flex items-center gap-3 px-6"
                                >
                                    <Swords className="h-4 w-4" />
                                    {isAuthenticated ? 'Nova batalha' : 'Iniciar protocolo'}
                                </Link>
                                <Link
                                    href={isAuthenticated ? route('battles.index') : route('login')}
                                    className="btn-quiet inline-flex items-center gap-3 px-6"
                                >
                                    <ScrollText className="h-4 w-4" />
                                    {isAuthenticated ? 'Abrir arquivo' : 'Já tenho acesso'}
                                </Link>
                            </div>

                            <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-[var(--line)] pt-5">
                                <span className="technical-label flex items-center gap-2">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success)]" /> Replay completo
                                </span>
                                <span className="technical-label flex items-center gap-2">
                                    <ShieldCheck className="h-3.5 w-3.5 text-[var(--success)]" /> Economia protegida
                                </span>
                            </div>
                        </div>

                        <aside className="dot-field flex flex-col justify-between p-5 sm:p-8 lg:p-10">
                            <div className="flex items-center justify-between">
                                <span className="technical-label text-[var(--accent)]">Figura 01 / Match-up</span>
                                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-app-muted">Kanto set</span>
                            </div>

                            <div className="relative my-12 min-h-[330px] border border-[var(--ink)] bg-[var(--paper-raised)] shadow-[8px_8px_0_var(--accent)]">
                                <div className="flex h-9 items-center justify-between border-b border-[var(--line)] px-3">
                                    <span className="technical-label">Prévia de confronto</span>
                                    <span className="font-mono text-xs text-[var(--battle)]">VS</span>
                                </div>

                                <div className="surface-grid relative grid min-h-[290px] place-items-center overflow-hidden">
                                    <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-[var(--line-strong)]" />
                                    <img
                                        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
                                        alt="Pikachu"
                                        className="absolute bottom-4 left-2 h-44 w-44 object-contain drop-shadow-xl sm:left-4"
                                    />
                                    <img
                                        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png"
                                        alt="Charizard"
                                        className="absolute right-0 top-1 h-52 w-52 object-contain drop-shadow-xl sm:right-2"
                                    />
                                    <span className="z-10 grid h-14 w-14 place-items-center border border-[var(--ink)] bg-[var(--paper-raised)] font-mono text-sm font-bold text-[var(--battle)] shadow-[4px_4px_0_var(--coin)]">
                                        VS
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 border border-[var(--ink)] bg-[var(--paper-raised)]">
                                <div className="border-r border-[var(--line)] p-4">
                                    <span className="technical-label">Modo</span>
                                    <strong className="mt-2 block text-sm text-app">Simulação 1 × 1</strong>
                                </div>
                                <div className="p-4 text-right">
                                    <span className="technical-label">Status</span>
                                    <strong className="mt-2 block text-sm text-[var(--success)]">Disponível</strong>
                                </div>
                            </div>
                        </aside>
                    </section>

                    <section className="app-frame border-t border-[var(--line)]">
                        <div className="grid md:grid-cols-3">
                            {protocolItems.map((item, index) => (
                                <div key={item.index} className={index < protocolItems.length - 1 ? 'md:border-r md:border-[var(--line)]' : ''}>
                                    <ProtocolItem {...item} />
                                </div>
                            ))}
                        </div>
                    </section>
                </main>

                <footer className="border-t border-[var(--line)]">
                    <div className="app-frame flex flex-col gap-2 px-4 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                        <span className="technical-label">PokeBet © {new Date().getFullYear()}</span>
                        <span className="technical-label">Laravel / Inertia / React</span>
                    </div>
                </footer>
            </div>
        </>
    );
}
