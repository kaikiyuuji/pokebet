import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Coins, Layers, Swords } from 'lucide-react';

export default function Edit({ mustVerifyEmail, status, stats }) {
    const { auth } = usePage().props;
    const user = auth.user;

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <p className="technical-label text-[var(--accent)]">05 / Identidade do treinador</p>
                    <h1 className="mt-3 text-4xl font-medium tracking-[-0.06em] text-app">Perfil.</h1>
                </div>
            }
        >
            <Head title="Perfil" />

            <div className="app-frame py-10">
                <div className="mx-auto max-w-3xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="poke-card overflow-hidden">
                        <div className="blueprint-grid flex h-20 items-center px-6">
                            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                                Identificação / treinador
                            </span>
                        </div>
                        <div className="px-6 py-6">
                            <div className="mb-6 flex items-center gap-4">
                                <img
                                    src={user.avatar_url}
                                    alt={user.name}
                                    className="h-20 w-20 shrink-0 border border-[var(--ink)] bg-[var(--paper)] object-cover shadow-[4px_4px_0_var(--accent)]"
                                />
                                <div className="min-w-0">
                                    <p className="technical-label text-[var(--accent)]">Conta ativa</p>
                                    <h3 className="mt-2 truncate text-2xl font-semibold tracking-[-0.04em] text-app">{user.name}</h3>
                                    {user.username && (
                                        <p className="mt-1 font-mono text-xs text-app-muted">@{user.username}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 border-t border-app pt-4 text-center">
                                <div>
                                    <p className="flex items-center justify-center gap-1 text-xl font-black text-[var(--coin)]">
                                        <Coins className="h-5 w-5" /> {user.coins.toLocaleString('pt-BR')}
                                    </p>
                                    <p className="mt-0.5 text-xs text-app-muted">Moedas</p>
                                </div>
                                <div>
                                    <p className="flex items-center justify-center gap-1 text-xl font-black text-blue-600">
                                        <Swords className="h-5 w-5" /> {stats?.battles_total ?? 0}
                                    </p>
                                    <p className="mt-0.5 text-xs text-app-muted">Batalhas</p>
                                </div>
                                <div>
                                    <p className="flex items-center justify-center gap-1 text-xl font-black text-[var(--accent)]">
                                        <Layers className="h-5 w-5" /> {stats?.pokemon_count ?? 0}
                                    </p>
                                    <p className="mt-0.5 text-xs text-app-muted">Pokémon</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="poke-card p-6">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </div>

                    <div className="poke-card p-6">
                        <UpdatePasswordForm />
                    </div>

                    <div className="poke-card p-6">
                        <DeleteUserForm />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
