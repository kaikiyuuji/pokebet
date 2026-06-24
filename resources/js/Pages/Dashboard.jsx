import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Coins,
    Handshake,
    Layers,
    ScrollText,
    ShoppingBag,
    Skull,
    Swords,
    TrendingUp,
    Trophy,
} from 'lucide-react';

const resultConfig = {
    win: { Icon: Trophy, label: 'Vitória', color: 'text-[var(--success)]', coins: (battle) => `+${battle.coins_awarded}` },
    loss: { Icon: Skull, label: 'Derrota', color: 'text-[var(--battle)]', coins: (battle) => `-${battle.bet_amount}` },
    draw: { Icon: Handshake, label: 'Empate', color: 'text-app-muted', coins: () => '0' },
};

function StatCell({ index, Icon, label, value, accent = false }) {
    return (
        <article className="group relative min-h-36 border-b border-[var(--line)] p-5 sm:border-b-0 sm:border-r sm:last:border-r-0">
            <div className="flex items-start justify-between">
                <span className="font-mono text-xs font-bold text-[var(--accent)]">{index}</span>
                <Icon className={`h-5 w-5 ${accent ? 'text-[var(--coin)]' : 'text-app-soft'}`} />
            </div>
            <strong className="mt-8 block text-3xl font-medium tracking-[-0.05em] text-app">{value}</strong>
            <span className="technical-label mt-2 block">{label}</span>
        </article>
    );
}

function RecentBattleRow({ battle, index }) {
    const config = resultConfig[battle.result] ?? resultConfig.draw;
    const { Icon } = config;

    return (
        <Link
            href={route('battle.show', battle.id)}
            className="group grid gap-4 border-b border-[var(--line)] px-4 py-5 transition-all hover:bg-[var(--paper-raised)] sm:grid-cols-[52px_1fr_auto_auto] sm:items-center"
        >
            <span className="font-mono text-xs font-bold text-[var(--accent)]">
                {String(index + 1).padStart(2, '0')}
            </span>

            <div className="flex min-w-0 items-center gap-4">
                <div className="flex w-20 shrink-0 -space-x-5">
                    <img src={battle.player.sprite} alt={battle.player.name} className="h-12 w-12 object-contain drop-shadow" />
                    <img src={battle.opponent.sprite} alt={battle.opponent.name} className="h-12 w-12 object-contain drop-shadow" />
                </div>
                <div className="min-w-0">
                    <p className="truncate font-semibold capitalize tracking-[-0.02em] text-app">
                        {battle.player.name} <span className="font-normal text-app-soft">vs</span> {battle.opponent.name}
                    </p>
                    <p className="technical-label mt-1">{battle.created_at}</p>
                </div>
            </div>

            <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${config.color}`}>
                <Icon className="h-3.5 w-3.5" /> {config.label}
            </span>

            <div className="flex items-center justify-between gap-5 sm:justify-end">
                <span className="font-mono text-xs font-bold text-app">{config.coins(battle)} moedas</span>
                <ArrowRight className="h-4 w-4 text-[var(--accent)] transition-transform group-hover:translate-x-1" />
            </div>
        </Link>
    );
}

function ModuleCard({ index, Icon, title, description, href, disabled }) {
    const content = (
        <article className={`poke-card hover-lift flex min-h-48 flex-col p-5 ${disabled ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between">
                <span className="font-mono text-xs font-bold text-[var(--accent)]">{index}</span>
                <Icon className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <h3 className="mt-8 text-2xl font-semibold tracking-[-0.045em] text-app">{title}</h3>
            <p className="mt-3 flex-1 text-sm leading-6 text-app-muted">{description}</p>
            <div className="mt-6 flex items-center justify-between border-t border-[var(--line)] pt-4">
                <span className="technical-label">{disabled ? 'Em desenvolvimento' : 'Abrir módulo'}</span>
                {!disabled && <ArrowRight className="h-4 w-4 text-[var(--accent)]" />}
            </div>
        </article>
    );

    return href && !disabled ? <Link href={href}>{content}</Link> : content;
}

export default function Dashboard({ stats, recentBattles }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const winRate = stats.battles > 0 ? Math.round((stats.wins / stats.battles) * 100) : 0;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="technical-label text-[var(--accent)]">01 / Central do treinador</p>
                        <h1 className="mt-3 text-4xl font-medium tracking-[-0.06em] text-app sm:text-5xl">
                            Olá, {user.name}.
                        </h1>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-app-muted">
                            Seu laboratório está pronto. Monitore o desempenho ou prepare o próximo confronto.
                        </p>
                    </div>
                    <Link href={route('battle.new')} className="btn-poke inline-flex items-center justify-center gap-3 px-6">
                        <Swords className="h-4 w-4" /> Nova batalha
                    </Link>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="app-frame border-b border-[var(--line)]">
                <section className="grid bg-[var(--paper-raised)] sm:grid-cols-4">
                    <StatCell index="01" Icon={Coins} label="Saldo disponível" value={user.coins.toLocaleString('pt-BR')} accent />
                    <StatCell index="02" Icon={Swords} label="Batalhas registradas" value={stats.battles.toLocaleString('pt-BR')} />
                    <StatCell index="03" Icon={Trophy} label="Vitórias confirmadas" value={stats.wins.toLocaleString('pt-BR')} />
                    <StatCell index="04" Icon={TrendingUp} label="Taxa de vitória" value={`${winRate}%`} />
                </section>
            </div>

            <div className="app-frame px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
                <div className="grid gap-10 lg:grid-cols-12">
                    <section className="lg:col-span-8">
                        <div className="mb-5 flex items-end justify-between border-b border-[var(--line)] pb-5">
                            <div>
                                <p className="technical-label text-[var(--accent)]">02 / Registro recente</p>
                                <h2 className="mt-3 text-3xl font-medium tracking-[-0.05em] text-app">Últimos confrontos</h2>
                            </div>
                            <Link href={route('battles.index')} className="technical-label hidden transition-colors hover:text-[var(--accent)] sm:block">
                                Ver arquivo completo ↗
                            </Link>
                        </div>

                        {recentBattles.length > 0 ? (
                            <div className="border-x border-t border-[var(--line)] bg-[var(--paper)]">
                                {recentBattles.map((battle, index) => (
                                    <RecentBattleRow key={battle.id} battle={battle} index={index} />
                                ))}
                            </div>
                        ) : (
                            <div className="dot-field border border-[var(--line)] px-6 py-16 text-center">
                                <Swords className="mx-auto h-10 w-10 text-app-soft" />
                                <p className="mt-5 text-lg font-semibold text-app">Nenhuma batalha registrada.</p>
                                <p className="mt-2 text-sm text-app-muted">Seu primeiro confronto vai inaugurar este arquivo.</p>
                            </div>
                        )}
                    </section>

                    <aside className="lg:col-span-4">
                        <div className="trainer-summary-card flex min-h-full flex-col justify-between p-6 sm:p-8">
                            <div className="trainer-summary-card__identity">
                                <p className="trainer-summary-card__label">Status / Conta ativa</p>
                                <img
                                    src={user.avatar_url}
                                    alt={user.name}
                                    className="mt-7 h-20 w-20 border border-white/70 bg-[#10131d] object-cover"
                                />
                                <h2 className="mt-5 text-3xl font-medium tracking-[-0.05em] text-white">{user.name}</h2>
                                {user.username && <p className="mt-1 font-mono text-xs font-medium text-white/85">@{user.username}</p>}
                            </div>

                            <div className="trainer-summary-card__stats mt-12 p-4">
                                <span className="trainer-summary-card__label">Desempenho acumulado</span>
                                <div className="mt-5 grid grid-cols-2 gap-3">
                                    <div className="trainer-summary-card__stat">
                                        <strong className="block text-2xl text-white">{stats.wins}</strong>
                                        <span>Vitórias</span>
                                    </div>
                                    <div className="trainer-summary-card__stat">
                                        <strong className="block text-2xl text-white">
                                            {stats.total_winnings.toLocaleString('pt-BR')}
                                        </strong>
                                        <span>Moedas ganhas</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>

                <section className="mt-14">
                    <div className="mb-6 border-b border-[var(--line)] pb-5">
                        <p className="technical-label text-[var(--accent)]">03 / Módulos</p>
                        <h2 className="mt-3 text-3xl font-medium tracking-[-0.05em] text-app">Escolha o próximo movimento</h2>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <ModuleCard
                            index="01"
                            Icon={Swords}
                            title="Arena"
                            description="Escolha um Pokémon, encontre um oponente e defina sua aposta."
                            href={route('battle.new')}
                        />
                        <ModuleCard
                            index="02"
                            Icon={ShoppingBag}
                            title="Mercado"
                            description="Adquira novos combatentes e amplie suas opções táticas."
                            disabled
                        />
                        <ModuleCard
                            index="03"
                            Icon={Layers}
                            title="Coleção"
                            description="Consulte seus Pokémon, atributos e histórico de uso."
                            disabled
                        />
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
