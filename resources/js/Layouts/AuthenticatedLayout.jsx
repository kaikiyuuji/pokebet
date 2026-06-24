import BrandMark from '@/Components/BrandMark';
import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import SoundToggle from '@/Components/SoundToggle';
import { useThemeMode } from '@/hooks/useThemeMode';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    ChevronDown,
    Coins,
    Menu,
    Moon,
    Sun,
    X,
} from 'lucide-react';

const navigation = [
    { index: '01', label: 'Visão geral', routeName: 'dashboard', href: () => route('dashboard') },
    { index: '02', label: 'Batalhar', routeName: 'battle', href: () => route('battle.new') },
    { index: '03', label: 'Arquivo', routeName: 'battles', href: () => route('battles.index') },
];

function isCurrent(item) {
    if (item.routeName === 'battle') {
        return route().current('battle.new') || route().current('battle.show');
    }

    if (item.routeName === 'battles') {
        return route().current('battles.*');
    }

    return route().current(item.routeName);
}

function DesktopNavItem({ item }) {
    return (
        <Link
            href={item.href()}
            className={`nav-technical ${isCurrent(item) ? 'is-active' : ''}`}
        >
            <span>{item.index}</span>
            {item.label}
        </Link>
    );
}

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isDark, toggleTheme } = useThemeMode();

    return (
        <div className="app-shell">
            <nav className="poke-topbar">
                <div className="app-frame grid min-h-[72px] grid-cols-[1fr_auto] items-center px-4 sm:px-6 lg:grid-cols-[240px_1fr_auto] lg:px-8">
                    <BrandMark href={route('dashboard')} />

                    <div className="hidden h-full items-stretch justify-center lg:flex">
                        {navigation.map((item) => <DesktopNavItem key={item.index} item={item} />)}
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        <span className="system-status hidden xl:inline-flex">Sistema online</span>

                        <div className="coin-readout hidden min-[440px]:inline-flex">
                            <Coins className="h-4 w-4" />
                            <span>{user.coins.toLocaleString('pt-BR')}</span>
                        </div>

                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="theme-toggle h-[38px] w-[38px]"
                            aria-label={isDark ? 'Usar tema claro' : 'Usar tema escuro'}
                            title={isDark ? 'Tema claro' : 'Tema escuro'}
                        >
                            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </button>

                        <SoundToggle />

                        <div className="hidden sm:block">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="flex h-[38px] items-center gap-2 border border-[var(--line)] bg-[var(--paper-raised)] px-2 text-app transition-colors hover:border-[var(--ink)]"
                                    >
                                        <img
                                            src={user.avatar_url}
                                            alt={user.name}
                                            className="h-7 w-7 border border-[var(--line)] object-cover"
                                        />
                                        <span className="max-w-28 truncate text-xs font-semibold">{user.name}</span>
                                        <ChevronDown className="h-3.5 w-3.5 text-app-muted" />
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}>Perfil</Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                        Sair
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>

                        <button
                            type="button"
                            onClick={() => setMobileOpen((value) => !value)}
                            className="theme-toggle h-[38px] w-[38px] lg:hidden"
                            aria-label="Abrir navegação"
                        >
                            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                {mobileOpen && (
                    <div className="border-t border-[var(--line)] bg-[var(--paper)] px-4 py-4 lg:hidden">
                        <div className="mx-auto grid max-w-3xl gap-2">
                            {navigation.map((item) => (
                                <ResponsiveNavLink
                                    key={item.index}
                                    href={item.href()}
                                    active={isCurrent(item)}
                                >
                                    <span className="mr-2 text-[var(--accent)]">{item.index}</span>
                                    {item.label}
                                </ResponsiveNavLink>
                            ))}
                            <div className="mt-2 flex items-center justify-between border-t border-[var(--line)] pt-3 sm:hidden">
                                <span className="truncate text-sm font-semibold text-app">{user.name}</span>
                                <div className="flex gap-2">
                                    <ResponsiveNavLink href={route('profile.edit')}>Perfil</ResponsiveNavLink>
                                    <ResponsiveNavLink method="post" href={route('logout')} as="button">Sair</ResponsiveNavLink>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {header && (
                <header className="app-header">
                    <div className="app-frame relative z-10 px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
                        <div className="animate-fade-up">{header}</div>
                    </div>
                </header>
            )}

            <main className="animate-fade-up">{children}</main>

            <footer className="mt-12 border-t border-[var(--line)]">
                <div className="app-frame flex flex-col gap-2 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                    <span className="technical-label">PokeBet © {new Date().getFullYear()}</span>
                    <span className="technical-label">Simulação auditável / economia protegida</span>
                </div>
            </footer>
        </div>
    );
}
