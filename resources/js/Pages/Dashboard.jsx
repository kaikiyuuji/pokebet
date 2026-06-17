import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Coins, Swords, Trophy, TrendingUp, ShoppingBag, Layers, ArrowRight, Sparkles, Skull, Handshake } from 'lucide-react';

function StatCard({ Icon, label, value, tone = 'red', index = 0 }) {
    const tones = {
        yellow: 'text-yellow-500 bg-yellow-100 border-yellow-300',
        blue:   'text-blue-600 bg-blue-100 border-blue-300',
        green:  'text-green-600 bg-green-100 border-green-300',
        red:    'text-red-600 bg-red-100 border-red-300',
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
            className={`poke-card hover-lift animate-fade-up h-full p-5 ${disabled ? 'opacity-55 grayscale' : ''}`}
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

const RESULT_CFG = {
    win:  { Icon: Trophy,    label: 'Vitória', cls: 'text-yellow-600', coins: (b) => `+${b.coins_awarded}` },
    loss: { Icon: Skull,     label: 'Derrota', cls: 'text-red-500',    coins: (b) => `-${b.bet_amount}`    },
    draw: { Icon: Handshake, label: 'Empate',  cls: 'text-slate-500',  coins: () => '0'                    },
};

function RecentBattleRow({ battle }) {
    const cfg = RESULT_CFG[battle.result] ?? RESULT_CFG.draw;
    const { Icon } = cfg;

    return (
        <Link
            href={route('battle.show', battle.id)}
            className="flex items-center gap-3 rounded-lg border border-app bg-app-surface px-3 py-2.5 transition-colors hover:bg-[var(--surface-strong)]"
        >
            <div className="flex -space-x-3">
                <img src={battle.player.sprite}   alt={battle.player.name}   className="h-10 w-10 object-contain drop-shadow" />
                <img src={battle.opponent.sprite} alt={battle.opponent.name} className="h-10 w-10 object-contain drop-shadow" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold capitalize text-app">
                    {battle.player.name} <span className="text-app-soft">vs</span> {battle.opponent.name}
                </p>
                <p className="text-xs text-app-muted">{battle.created_at}</p>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-0.5">
                <span className={`flex items-center gap-1 text-xs font-bold ${cfg.cls}`}>
                    <Icon className="h-3 w-3" /> {cfg.label}
                </span>
                <span className={`text-xs font-semibold ${battle.result === 'win' ? 'text-green-600' : battle.result === 'loss' ? 'text-red-500' : 'text-app-soft'}`}>
                    {cfg.coins(battle)} moedas
                </span>
            </div>
        </Link>
    );
}

export default function Dashboard({ stats, recentBattles }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const winRate = stats.battles > 0
        ? Math.round((stats.wins / stats.battles) * 100)
        : null;

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
                            <h2 className="truncate text-xl font-black text-app">Olá, {user.name}!</h2>
                            {user.username && <p className="text-sm text-app-muted">@{user.username}</p>}
                        </div>
                    </div>
                    <Sparkles className="hidden h-6 w-6 text-yellow-500 animate-soft-pulse sm:block" />
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <StatCard Icon={Coins}      label="Moedas"       value={user.coins.toLocaleString('pt-BR')}              tone="yellow" index={0} />
                        <StatCard Icon={Swords}     label="Batalhas"     value={stats.battles.toLocaleString('pt-BR')}           tone="blue"   index={1} />
                        <StatCard Icon={Trophy}     label="Vitórias"     value={stats.wins.toLocaleString('pt-BR')}              tone="green"  index={2} />
                        <StatCard Icon={TrendingUp} label="Taxa de vitória" value={winRate !== null ? `${winRate}%` : '—'}       tone="red"    index={3} />
                    </div>

                    {/* Recent battles */}
                    {recentBattles.length > 0 && (
                        <section className="mt-8 animate-fade-up" style={{ animationDelay: '280ms' }}>
                            <div className="mb-3 flex items-center justify-between gap-4">
                                <h3 className="text-base font-black text-app">Últimas batalhas</h3>
                                <Link href={route('battles.index')} className="text-xs font-semibold text-app-muted hover:text-app">
                                    Ver todas →
                                </Link>
                            </div>
                            <div className="flex flex-col gap-2">
                                {recentBattles.map((b) => (
                                    <RecentBattleRow key={b.id} battle={b} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Actions */}
                    <section className="mt-8">
                        <div className="mb-4">
                            <h3 className="text-lg font-black text-app">Começar</h3>
                            <p className="text-sm text-app-muted">Escolha uma ação e entre no ritmo da batalha.</p>
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
