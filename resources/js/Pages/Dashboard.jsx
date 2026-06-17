import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Coins, Swords, Trophy, Layers, ShoppingBag } from 'lucide-react';

function StatCard({ Icon, label, value, color = 'indigo' }) {
    const colors = {
        yellow: 'bg-slate-800 border-yellow-500 text-yellow-400',
        indigo: 'bg-slate-800 border-indigo-500 text-indigo-400',
        green:  'bg-slate-800 border-green-500 text-green-400',
        red:    'bg-slate-800 border-red-500 text-red-400',
    };

    return (
        <div className={`rounded-xl border-2 p-5 ${colors[color]}`}>
            <Icon className="w-6 h-6 mb-1 opacity-80" />
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-sm mt-0.5 opacity-70">{label}</div>
        </div>
    );
}

function ActionCard({ Icon, title, description, href, disabled }) {
    const inner = (
        <div className={`flex items-start gap-4 rounded-xl border p-5 transition-all duration-150 ${
            disabled
                ? 'border-slate-600 bg-slate-700 opacity-40 cursor-not-allowed'
                : 'border-red-700 bg-red-900 bg-opacity-40 hover:bg-opacity-60 hover:shadow-lg cursor-pointer'
        }`}>
            <Icon className={`w-8 h-8 shrink-0 ${disabled ? 'text-slate-500' : 'text-red-400'}`} />
            <div>
                <p className={`font-semibold ${disabled ? 'text-slate-400' : 'text-white'}`}>{title}</p>
                <p className={`text-sm mt-0.5 ${disabled ? 'text-slate-500' : 'text-slate-300'}`}>{description}</p>
                {disabled && <p className="text-xs text-slate-500 mt-1">Em breve</p>}
            </div>
        </div>
    );

    if (href) return <Link href={href}>{inner}</Link>;
    return <div>{inner}</div>;
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
                        className="h-10 w-10 rounded-full object-cover border-2 border-red-200"
                    />
                    <div>
                        <h2 className="text-xl font-semibold text-white">
                            Olá, {user.name}!
                        </h2>
                        {user.username && (
                            <p className="text-sm text-slate-400">@{user.username}</p>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <StatCard Icon={Coins}  label="Moedas"   value={user.coins.toLocaleString('pt-BR')} color="yellow" />
                        <StatCard Icon={Swords} label="Batalhas" value="—" color="indigo" />
                        <StatCard Icon={Trophy} label="Vitórias" value="—" color="green" />
                        <StatCard Icon={Layers} label="Pokémon"  value="—" color="red" />
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Começar</h3>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <ActionCard
                                Icon={Swords}
                                title="Nova Batalha"
                                description="Escolha um Pokémon e batalhe"
                                href={route('battle.new')}
                            />
                            <ActionCard Icon={ShoppingBag} title="Loja" description="Compre novos Pokémon" disabled />
                            <ActionCard Icon={Layers} title="Coleção" description="Veja seus Pokémon" disabled />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
