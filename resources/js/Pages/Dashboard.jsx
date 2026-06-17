import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Coins, Swords, Trophy, Layers, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';

function StatCard({ Icon, label, value, tone = 'red', index = 0 }) {
    const tones = {
        yellow: 'text-yellow-500 bg-yellow-100 border-yellow-300',
        blue: 'text-blue-600 bg-blue-100 border-blue-300',
        green: 'text-green-600 bg-green-100 border-green-300',
        red: 'text-red-600 bg-red-100 border-red-300',
    };

    return (
        <div className="poke-card hover-lift animate-fade-up p-4" style={{ animationDelay: `${index * 70}ms` }}>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-2xl font-black text-app">{value}</div>
                    <div className="mt-1 text-sm font-semibold text-app-muted">{label}</div>
                </div>
                <span className={`flex h-10 w-10 items-center justify-center rounded border ${tones[tone]}`}>
                    <Icon className="h-5 w-5" />
                </span>
            </div>
        </div>
    );
}

function ActionCard({ Icon, title, description, href, disabled, index = 0 }) {
    const content = (
        <div
            className={`poke-card hover-lift animate-fade-up h-full p-5 ${
                disabled ? 'opacity-55 grayscale' : ''
            }`}
            style={{ animationDelay: `${180 + index * 70}ms` }}
        >
            <div className="flex h-full flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                    <span className={`flex h-11 w-11 items-center justify-center rounded border-2 ${
                        disabled
                            ? 'border-slate-300 bg-slate-100 text-slate-400'
                            : 'border-red-800 bg-red-100 text-red-600'
                    }`}>
                        <Icon className="h-6 w-6" />
                    </span>
                    {!disabled && <ArrowRight className="h-5 w-5 text-app-soft" />}
                </div>
                <div>
                    <p className="text-base font-black text-app">{title}</p>
                    <p className="mt-1 text-sm text-app-muted">{description}</p>
                    {disabled && <p className="mt-3 text-xs font-bold uppercase text-app-soft">Em breve</p>}
                </div>
            </div>
        </div>
    );

    if (href && !disabled) return <Link href={href}>{content}</Link>;
    return content;
}

export default function Dashboard() {
    const { auth } = usePage().props;
    const user = auth.user;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <img
                            src={user.avatar_url}
                            alt={user.name}
                            className="h-11 w-11 rounded-full border-2 border-yellow-300 object-cover shadow-[2px_2px_0_#1d2a44]"
                        />
                        <div className="min-w-0">
                            <h2 className="truncate text-xl font-black text-app">
                                Olá, {user.name}!
                            </h2>
                            {user.username && (
                                <p className="text-sm text-app-muted">@{user.username}</p>
                            )}
                        </div>
                    </div>
                    <Sparkles className="hidden h-6 w-6 text-yellow-500 animate-soft-pulse sm:block" />
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <StatCard Icon={Coins} label="Moedas" value={user.coins.toLocaleString('pt-BR')} tone="yellow" index={0} />
                        <StatCard Icon={Swords} label="Batalhas" value="—" tone="blue" index={1} />
                        <StatCard Icon={Trophy} label="Vitórias" value="—" tone="green" index={2} />
                        <StatCard Icon={Layers} label="Pokémon" value="—" tone="red" index={3} />
                    </div>

                    <section className="mt-8">
                        <div className="mb-4 flex items-end justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-black text-app">Começar</h3>
                                <p className="text-sm text-app-muted">Escolha uma ação e entre no ritmo da batalha.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <ActionCard
                                Icon={Swords}
                                title="Nova Batalha"
                                description="Escolha um Pokémon e simule o confronto."
                                href={route('battle.new')}
                                index={0}
                            />
                            <ActionCard
                                Icon={ShoppingBag}
                                title="Loja"
                                description="Compre novos Pokémon para o seu time."
                                disabled
                                index={1}
                            />
                            <ActionCard
                                Icon={Layers}
                                title="Coleção"
                                description="Veja os Pokémon que você já desbloqueou."
                                disabled
                                index={2}
                            />
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
