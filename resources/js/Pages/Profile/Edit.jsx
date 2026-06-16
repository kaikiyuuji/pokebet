import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status, stats }) {
    const { auth } = usePage().props;
    const user = auth.user;

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Perfil</h2>}
        >
            <Head title="Perfil" />

            <div className="py-10">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Profile card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-24" />
                        <div className="px-6 pb-6">
                            <div className="flex items-end gap-4 -mt-10 mb-4">
                                <img
                                    src={user.avatar_url}
                                    alt={user.name}
                                    className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-md"
                                />
                                <div className="mb-1">
                                    <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                                    {user.username && (
                                        <p className="text-sm text-gray-500">@{user.username}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-center border-t pt-4">
                                <div>
                                    <p className="text-xl font-bold text-yellow-600">
                                        🪙 {user.coins.toLocaleString('pt-BR')}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">Moedas</p>
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-indigo-600">{stats?.battles_total ?? 0}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Batalhas</p>
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-red-500">{stats?.pokemon_count ?? 0}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Pokémon</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Update profile info */}
                    <div className="bg-white p-6 shadow-sm rounded-xl border border-gray-100">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </div>

                    {/* Update password */}
                    <div className="bg-white p-6 shadow-sm rounded-xl border border-gray-100">
                        <UpdatePasswordForm />
                    </div>

                    {/* Delete account */}
                    <div className="bg-white p-6 shadow-sm rounded-xl border border-red-100">
                        <DeleteUserForm />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
