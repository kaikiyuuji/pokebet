import BrandMark from '@/Components/BrandMark';
import SoundToggle from '@/Components/SoundToggle';
import { useThemeMode } from '@/hooks/useThemeMode';
import { Moon, ShieldCheck, Sun, Swords } from 'lucide-react';

export default function GuestLayout({ children }) {
    const { isDark, toggleTheme } = useThemeMode();

    return (
        <div className="app-shell min-h-screen p-3 sm:p-6">
            <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-6xl overflow-hidden border border-[var(--ink)] bg-[var(--paper-raised)] sm:min-h-[calc(100vh-3rem)] lg:grid-cols-[0.9fr_1.1fr]">
                <aside className="blueprint-grid relative hidden flex-col justify-between overflow-hidden p-10 lg:flex">
                    <BrandMark inverse />

                    <div className="relative z-10 max-w-md">
                        <p className="technical-label !text-white/65">Acesso / Battle Lab</p>
                        <h1 className="mt-5 text-6xl font-medium leading-[0.84] tracking-[-0.07em] text-white">
                            Entre no laboratório.
                        </h1>
                        <p className="mt-6 max-w-sm text-sm leading-7 text-white/70">
                            Batalhas simuladas, apostas registradas e cada turno disponível para revisão.
                        </p>
                    </div>

                    <div className="grid gap-3 border-t border-white/30 pt-6">
                        <span className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white/75">
                            <Swords className="h-4 w-4" /> Confrontos reproduzíveis
                        </span>
                        <span className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white/75">
                            <ShieldCheck className="h-4 w-4" /> Economia validada no servidor
                        </span>
                    </div>
                </aside>

                <main className="relative flex min-h-full flex-col">
                    <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4 lg:justify-end">
                        <div className="lg:hidden">
                            <BrandMark />
                        </div>
                        <div className="flex gap-2">
                            <SoundToggle className="h-10 w-10" />
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="theme-toggle h-10 w-10"
                                aria-label={isDark ? 'Usar tema claro' : 'Usar tema escuro'}
                            >
                                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="dot-field flex flex-1 items-center justify-center p-5 sm:p-10">
                        <div className="poke-card animate-pop w-full max-w-md p-6 sm:p-8">
                            <p className="technical-label mb-6 text-[var(--accent)]">Identificação do treinador</p>
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
