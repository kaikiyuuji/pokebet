import { useThemeMode } from '@/hooks/useThemeMode';
import { Link } from '@inertiajs/react';
import { Moon, Sun, Zap } from 'lucide-react';

export default function GuestLayout({ children }) {
    const { isDark, toggleTheme } = useThemeMode();

    return (
        <div className="app-shell flex min-h-screen flex-col items-center px-4 pt-6 sm:justify-center sm:pt-0">
            <button
                type="button"
                onClick={toggleTheme}
                className="btn-quiet fixed right-4 top-4 z-10 flex h-10 w-10 items-center justify-center"
                aria-label={isDark ? 'Usar tema claro' : 'Usar tema escuro'}
                title={isDark ? 'Tema claro' : 'Tema escuro'}
            >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <Link href="/" className="group flex flex-col items-center gap-2">
                <span className="flex h-14 w-14 items-center justify-center rounded border-2 border-slate-900 bg-yellow-300 text-red-700 shadow-[4px_4px_0_#1d2a44] transition-transform group-hover:-rotate-6 group-hover:scale-105">
                    <Zap className="h-8 w-8 fill-current" />
                </span>
                <span className="font-pixel text-sm text-app">PokéBet</span>
            </Link>

            <div className="poke-card animate-pop mt-6 w-full px-6 py-6 sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
