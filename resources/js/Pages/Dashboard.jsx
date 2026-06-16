import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';

function StatCard({ icon, label, value, color = 'indigo' }) {
    const colors = {
        yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
        indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
        green:  'bg-green-50 border-green-200 text-green-700',
        red:    'bg-red-50 border-red-200 text-red-700',
    };

    return (
        <div className={`rounded-xl border p-5 ${colors[color]}`}>
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-sm mt-0.5 opacity-80">{label}</div>
        </div>
    );
}

function ActionCard({ icon, title, description, disabled }) {
    return (
        <div className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${
            disabled
                ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                : 'border-indigo-100 bg-indigo-50 hover:bg-indigo-100 cursor-pointer'
        }`}>
            <span className="text-3xl">{icon}</span>
            <div>
                <p className="font-semibold text-gray-800">{title}</p>
                <p className="text-sm text-gray-500">{description}</p>
                {disabled && <p className="text-xs text-gray-400 mt-1">Em breve</p>}
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { auth } = usePage().props;
    const user = auth.user;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="h-10 w-10 rounded-full object-cover border-2 border-indigo-200"
                    />
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            Olá, {user.name}!
                        </h2>
                        {user.username && (
                            <p className="text-sm text-gray-500">@{user.username}</p>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <StatCard icon="🪙" label="Moedas" value={user.coins.toLocaleString('pt-BR')} color="yellow" />
                        <StatCard icon="⚔️" label="Batalhas" value="—" color="indigo" />
                        <StatCard icon="🏆" label="Vitórias" value="—" color="green" />
                        <StatCard icon="🎴" label="Pokémon" value="—" color="red" />
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Começar</h3>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <ActionCard icon="⚔️" title="Nova Batalha" description="Escolha um Pokémon e batalhe" disabled />
                            <ActionCard icon="🏪" title="Loja" description="Compre novos Pokémon" disabled />
                            <ActionCard icon="🎴" title="Coleção" description="Veja seus Pokémon" disabled />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
