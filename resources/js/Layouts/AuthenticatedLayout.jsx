import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Zap, Swords, ScrollText, Coins, ChevronDown } from 'lucide-react';

function NavItem({ href, active, children }) {
    return (
        <Link
            href={href}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-semibold transition-colors ${
                active
                    ? 'bg-red-900 text-yellow-300'
                    : 'text-red-100 hover:bg-red-700 hover:text-white'
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

    return (
        <div className="min-h-screen bg-slate-100">
            <nav className="border-b-4 border-red-900 bg-red-700 shadow-lg">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-14 justify-between">
                        {/* Left: Logo + nav links */}
                        <div className="flex items-center gap-6">
                            <Link href={route('dashboard')} className="flex items-center gap-2 shrink-0">
                                <Zap className="w-5 h-5 text-yellow-300" />
                                <span className="font-pixel text-yellow-300 text-[10px] hidden sm:block tracking-tight">
                                    PokéBet
                                </span>
                            </Link>

                            <div className="hidden sm:flex sm:items-center sm:gap-1">
                                <NavItem href={route('dashboard')} active={route().current('dashboard')}>
                                    Dashboard
                                </NavItem>
                                <NavItem
                                    href={route('battle.new')}
                                    active={route().current('battle.new') || route().current('battle.show')}
                                >
                                    <Swords className="w-3.5 h-3.5" /> Batalha
                                </NavItem>
                                <NavItem href={route('battles.index')} active={route().current('battles.*')}>
                                    <ScrollText className="w-3.5 h-3.5" /> Histórico
                                </NavItem>
                            </div>
                        </div>

                        {/* Right: coins + user menu */}
                        <div className="hidden sm:flex sm:items-center sm:gap-3">
                            <div className="flex items-center gap-1.5 rounded border-2 border-yellow-400 bg-yellow-400 bg-opacity-20 px-3 py-1 text-sm font-bold text-yellow-300">
                                <Coins className="w-4 h-4" />
                                <span>{user.coins.toLocaleString('pt-BR')}</span>
                            </div>

                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="flex items-center gap-2 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    >
                                        <img
                                            src={user.avatar_url}
                                            alt={user.name}
                                            className="h-7 w-7 rounded-full object-cover border-2 border-red-300"
                                        />
                                        <span className="text-sm font-medium text-red-100">{user.name}</span>
                                        <ChevronDown className="h-4 w-4 text-red-300" />
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

                        {/* Mobile menu button */}
                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((prev) => !prev)}
                                className="inline-flex items-center justify-center rounded-md p-2 text-red-200 hover:bg-red-600 focus:outline-none"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden border-t border-red-800'}>
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

                    <div className="border-t border-red-800 pb-1 pt-4">
                        <div className="px-4 flex items-center gap-3">
                            <img src={user.avatar_url} alt={user.name} className="h-10 w-10 rounded-full object-cover border-2 border-red-300" />
                            <div>
                                <div className="text-base font-medium text-red-100">{user.name}</div>
                                <div className="text-sm text-yellow-300 flex items-center gap-1">
                                    <Coins className="w-3.5 h-3.5" />
                                    <span>{user.coins.toLocaleString('pt-BR')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>Perfil</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                Sair
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
