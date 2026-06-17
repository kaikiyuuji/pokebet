import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { useThemeMode } from '@/hooks/useThemeMode';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    Zap, Swords, ScrollText, Coins, ChevronDown, Moon, Sun, Menu, X,
} from 'lucide-react';

function NavItem({ href, active, children }) {
    return (
        <Link
            href={href}
            className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-bold transition-all duration-150 ${
                active
                    ? 'bg-white text-red-700 shadow-sm'
                    : 'text-white/90 hover:-translate-y-0.5 hover:bg-white/15 hover:text-white'
            }`}
        >
            {children}
        </Link>
    );
}

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const { isDark, toggleTheme } = useThemeMode();

    return (
        <div className="app-shell">
            <nav className="poke-topbar">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-5">
                            <Link
                                href={route('dashboard')}
                                className="group flex shrink-0 items-center gap-2"
                            >
                                <span className="flex h-9 w-9 items-center justify-center rounded border-2 border-white bg-yellow-300 text-red-700 shadow-[2px_2px_0_#1d2a44] transition-transform group-hover:-rotate-6 group-hover:scale-105">
                                    <Zap className="h-5 w-5 fill-current" />
                                </span>
                                <span className="font-pixel hidden text-[10px] text-white drop-shadow sm:block">
                                    PokéBet
                                </span>
                            </Link>

                            <div className="hidden items-center gap-1 sm:flex">
                                <NavItem href={route('dashboard')} active={route().current('dashboard')}>
                                    Dashboard
                                </NavItem>
                                <NavItem
                                    href={route('battle.new')}
                                    active={route().current('battle.new') || route().current('battle.show')}
                                >
                                    <Swords className="h-3.5 w-3.5" /> Batalha
                                </NavItem>
                                <NavItem href={route('battles.index')} active={route().current('battles.*')}>
                                    <ScrollText className="h-3.5 w-3.5" /> Histórico
                                </NavItem>
                            </div>
                        </div>

                        <div className="hidden items-center gap-3 sm:flex">
                            <div className="flex items-center gap-1.5 rounded border-2 border-yellow-200 bg-black/20 px-3 py-1 text-sm font-black text-yellow-200 shadow-[2px_2px_0_#1d2a44]">
                                <Coins className="h-4 w-4" />
                                <span>{user.coins.toLocaleString('pt-BR')}</span>
                            </div>

                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="theme-toggle flex h-9 w-9 items-center justify-center"
                                aria-label={isDark ? 'Usar tema claro' : 'Usar tema escuro'}
                                title={isDark ? 'Tema claro' : 'Tema escuro'}
                            >
                                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </button>

                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="flex items-center gap-2 rounded px-2 py-1 text-white/95 transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                                    >
                                        <img
                                            src={user.avatar_url}
                                            alt={user.name}
                                            className="h-8 w-8 rounded-full border-2 border-yellow-200 object-cover"
                                        />
                                        <span className="max-w-32 truncate text-sm font-semibold">{user.name}</span>
                                        <ChevronDown className="h-4 w-4 text-yellow-100" />
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

                        <div className="-me-2 flex items-center gap-2 sm:hidden">
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="theme-toggle flex h-9 w-9 items-center justify-center"
                                aria-label={isDark ? 'Usar tema claro' : 'Usar tema escuro'}
                            >
                                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowingNavigationDropdown((prev) => !prev)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded border-2 border-white/70 bg-black/10 text-white transition-colors hover:bg-white/15 focus:outline-none"
                                aria-label="Abrir menu"
                            >
                                {showingNavigationDropdown ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' border-t border-white/20 bg-red-800/95 sm:hidden'}>
                    <div className="space-y-1 px-3 pb-3 pt-2">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('battle.new')} active={route().current('battle.new') || route().current('battle.show')}>
                            Batalha
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('battles.index')} active={route().current('battles.*')}>
                            Histórico
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-white/20 pb-4 pt-4">
                        <div className="flex items-center gap-3 px-4">
                            <img src={user.avatar_url} alt={user.name} className="h-10 w-10 rounded-full border-2 border-yellow-200 object-cover" />
                            <div className="min-w-0">
                                <div className="truncate text-base font-semibold text-white">{user.name}</div>
                                <div className="flex items-center gap-1 text-sm font-bold text-yellow-200">
                                    <Coins className="h-3.5 w-3.5" />
                                    <span>{user.coins.toLocaleString('pt-BR')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 space-y-1 px-3">
                            <ResponsiveNavLink href={route('profile.edit')}>Perfil</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                Sair
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="app-header">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        <div className="animate-fade-up">{header}</div>
                    </div>
                </header>
            )}

            <main className="animate-fade-up">{children}</main>
        </div>
    );
}
