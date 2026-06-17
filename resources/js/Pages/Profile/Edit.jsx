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
            header={<h2 className="text-xl font-black leading-tight text-app">Perfil</h2>}
        >
            <Head title="Perfil" />

            <div className="py-10">
                <div className="mx-auto max-w-3xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="poke-card overflow-hidden">
                        <div className="h-24 bg-gradient-to-r from-red-600 via-yellow-400 to-blue-600" />
                        <div className="px-6 pb-6">
                            <div className="-mt-10 mb-4 flex items-end gap-4">
                                <img
                                    src={user.avatar_url}
                                    alt={user.name}
                                    className="h-20 w-20 rounded-full border-4 border-yellow-300 object-cover shadow-md"
                                />
                                <div className="mb-1 min-w-0">
                                    <h3 className="truncate text-lg font-black text-app">{user.name}</h3>
                                    {user.username && (
                                        <p className="text-sm text-app-muted">@{user.username}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 border-t border-app pt-4 text-center">
                                <div>
                                    <p className="flex items-center justify-center gap-1 text-xl font-black text-yellow-600">
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
                                    <p className="flex items-center justify-center gap-1 text-xl font-black text-red-500">
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
