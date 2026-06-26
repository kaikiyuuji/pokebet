import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { sound } from '@/hooks/useSound';
import { Head, usePage } from '@inertiajs/react';
import {
    Clock3,
    Coins,
    Gift,
    History,
    RefreshCw,
    RotateCw,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const WHEEL_COLORS = [
    'var(--wheel-segment-1)',
    'var(--wheel-segment-2)',
    'var(--wheel-segment-3)',
    'var(--wheel-segment-4)',
    'var(--wheel-segment-5)',
    'var(--wheel-segment-6)',
    'var(--wheel-segment-7)',
    'var(--wheel-segment-8)',
    'var(--wheel-segment-9)',
    'var(--wheel-segment-10)',
];

function formatChance(chance) {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: chance < 0.1 ? 2 : 0,
        maximumFractionDigits: 4,
    }).format(chance);
}

function formatCountdown(nextSpinAt, now) {
    if (!nextSpinAt) return 'Disponível agora';

    const remaining = Math.max(0, new Date(nextSpinAt).getTime() - now);
    if (remaining <= 0) return 'Disponível agora';

    const totalSeconds = Math.ceil(remaining / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
        .map((value) => String(value).padStart(2, '0'))
        .join(':');
}

function outcomeMessage(outcome) {
    if (!outcome) return null;
    if (outcome.type === 'reroll') return 'Você recebeu um giro bônus imediato.';
    if (outcome.type === 'nothing') return 'Desta vez a roleta não liberou moedas.';
    return `${outcome.coins.toLocaleString('pt-BR')} moedas foram adicionadas ao seu saldo.`;
}

function playSpinTicks() {
    let tick = 0;
    let timer;

    const next = () => {
        sound.rouletteTick(tick);
        tick += 1;

        if (tick < 34) {
            const progress = tick / 34;
            timer = window.setTimeout(next, 45 + (progress ** 2) * 190);
        }
    };

    next();
    return () => window.clearTimeout(timer);
}

function RouletteWheel({ segments, rotation, spinning }) {
    const segmentAngle = 360 / segments.length;
    const gradient = segments
        .map((segment, index) => {
            const start = index * segmentAngle;
            const end = (index + 1) * segmentAngle;
            return `${WHEEL_COLORS[index % WHEEL_COLORS.length]} ${start}deg ${end}deg`;
        })
        .join(', ');

    return (
        <div className="hourly-wheel-shell">
            <div className="hourly-wheel-pointer" aria-hidden="true" />
            <div
                className={`hourly-wheel ${spinning ? 'is-spinning' : ''}`}
                style={{
                    background: `conic-gradient(from -${segmentAngle / 2}deg, ${gradient})`,
                    transform: `rotate(${rotation}deg)`,
                }}
            >
                <div className="hourly-wheel__grid" />
                {segments.map((segment, index) => {
                    const angle = index * segmentAngle;

                    return (
                        <span
                            key={segment.key}
                            className="hourly-wheel__label"
                            style={{
                                '--segment-angle': `${angle}deg`,
                            }}
                        >
                            {segment.type === 'reroll'
                                ? '↻'
                                : segment.type === 'nothing'
                                    ? '0'
                                    : segment.coins.toLocaleString('pt-BR')}
                        </span>
                    );
                })}
                <div className="hourly-wheel__hub">
                    <span>PB</span>
                </div>
            </div>
        </div>
    );
}

function OddsList({ segments }) {
    return (
        <div className="grid gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2">
            {segments.map((segment) => (
                <div key={segment.key} className="flex items-center justify-between gap-4 bg-[var(--paper-raised)] px-4 py-3">
                    <span className="text-sm font-semibold text-app">{segment.label}</span>
                    <span className="font-mono text-[10px] font-bold text-[var(--accent)]">
                        {formatChance(segment.chance)}%
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function Index({ segments, roulette: initialRoulette, recentSpins: initialRecentSpins }) {
    const { auth } = usePage().props;
    const [roulette, setRoulette] = useState(initialRoulette);
    const [recentSpins, setRecentSpins] = useState(initialRecentSpins);
    const [balance, setBalance] = useState(auth.user.coins);
    const [rotation, setRotation] = useState(0);
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [now, setNow] = useState(Date.now());
    const finishTimer = useRef(null);
    const stopTicks = useRef(null);

    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => () => {
        window.clearTimeout(finishTimer.current);
        stopTicks.current?.();
    }, []);

    const canSpin = roulette.bonus_spins > 0
        || roulette.can_spin
        || (roulette.next_spin_at && new Date(roulette.next_spin_at).getTime() <= now);

    const countdown = useMemo(
        () => formatCountdown(roulette.next_spin_at, now),
        [roulette.next_spin_at, now],
    );

    const handleSpin = async () => {
        if (!canSpin || spinning) return;

        setSpinning(true);
        setResult(null);
        setError('');

        try {
            const response = await window.axios.post(route('roulette.spin'));
            const payload = response.data;
            const targetIndex = segments.findIndex((segment) => segment.key === payload.outcome.key);
            const segmentAngle = 360 / segments.length;
            const targetAngle = Math.max(0, targetIndex) * segmentAngle;
            const normalizedTarget = (360 - targetAngle) % 360;
            const nextRotation = (Math.floor(rotation / 360) + 7) * 360 + normalizedTarget;

            setRotation(nextRotation);
            stopTicks.current = playSpinTicks();

            finishTimer.current = window.setTimeout(() => {
                stopTicks.current?.();
                sound.rouletteReveal();
                setSpinning(false);
                setResult(payload.outcome);
                setRoulette(payload.roulette);
                setBalance(payload.balance);
                setRecentSpins((current) => [
                    {
                        id: payload.spin_id,
                        outcome_type: payload.outcome.type,
                        coins_awarded: payload.outcome.coins,
                        bonus_spin_awarded: payload.outcome.type === 'reroll',
                        created_at: 'Agora',
                    },
                    ...current,
                ].slice(0, 8));
                window.dispatchEvent(new CustomEvent('pokebet:coins-updated', {
                    detail: { coins: payload.balance },
                }));
            }, 4700);
        } catch (requestError) {
            const payload = requestError.response?.data;
            setSpinning(false);
            setError(payload?.message ?? 'Não foi possível girar a roleta.');

            if (payload?.next_spin_at) {
                setRoulette((current) => ({
                    ...current,
                    can_spin: false,
                    next_spin_at: payload.next_spin_at,
                }));
            }
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="technical-label text-[var(--accent)]">04 / Recompensa horária</p>
                        <h1 className="mt-3 text-4xl font-medium tracking-[-0.06em] text-app sm:text-5xl">
                            Roleta de moedas.
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-app-muted">
                            Um giro por hora. Resultados, cooldown e saldo são definidos e registrados pelo servidor.
                        </p>
                    </div>
                    <div className="coin-readout self-start sm:self-auto">
                        <Coins className="h-4 w-4" />
                        <span>{balance.toLocaleString('pt-BR')}</span>
                    </div>
                </div>
            }
        >
            <Head title="Roleta de moedas" />

            <div className="app-frame px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
                    <section className="dot-field flex min-h-[560px] flex-col items-center justify-center border border-[var(--line)] p-5 sm:p-8">
                        <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
                            {roulette.bonus_spins > 0 ? (
                                <span className="roulette-availability roulette-availability--bonus">
                                    <RefreshCw className="h-4 w-4" />
                                    {roulette.bonus_spins} giro bônus
                                </span>
                            ) : (
                                <span className={`roulette-availability ${canSpin ? 'roulette-availability--ready' : ''}`}>
                                    <Clock3 className="h-4 w-4" />
                                    {canSpin ? 'Giro disponível' : countdown}
                                </span>
                            )}
                        </div>

                        <RouletteWheel segments={segments} rotation={rotation} spinning={spinning} />

                        <button
                            type="button"
                            onClick={handleSpin}
                            disabled={!canSpin || spinning}
                            className="btn-poke mt-9 inline-flex min-w-56 items-center justify-center gap-3 px-7 disabled:cursor-not-allowed disabled:opacity-40"
                            data-sound="none"
                        >
                            <RotateCw className={`h-4 w-4 ${spinning ? 'animate-spin' : ''}`} />
                            {spinning
                                ? 'Girando...'
                                : roulette.bonus_spins > 0
                                    ? 'Usar giro bônus'
                                    : canSpin
                                        ? 'Girar roleta'
                                        : countdown}
                        </button>

                        {result && (
                            <div className={`roulette-result roulette-result--${result.type} mt-7`}>
                                {result.type === 'coins' && <Coins className="h-6 w-6" />}
                                {result.type === 'reroll' && <RefreshCw className="h-6 w-6" />}
                                {result.type === 'nothing' && <X className="h-6 w-6" />}
                                <div>
                                    <strong>{result.label}</strong>
                                    <p>{outcomeMessage(result)}</p>
                                </div>
                            </div>
                        )}

                        {error && <p className="mt-5 text-sm font-semibold text-[var(--battle)]">{error}</p>}
                    </section>

                    <aside className="space-y-8">
                        <section>
                            <div className="mb-4">
                                <p className="technical-label text-[var(--accent)]">01 / Probabilidades</p>
                                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-app">Resultados possíveis</h2>
                            </div>
                            <OddsList segments={segments} />
                            <p className="mt-3 text-xs leading-5 text-app-muted">
                                As chances são informativas. A seleção real acontece exclusivamente no backend.
                            </p>
                        </section>

                        <section>
                            <div className="mb-4">
                                <p className="technical-label text-[var(--accent)]">02 / Histórico</p>
                                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-app">Últimos giros</h2>
                            </div>

                            <div className="border-x border-t border-[var(--line)]">
                                {recentSpins.length === 0 ? (
                                    <div className="border-b border-[var(--line)] bg-[var(--paper-raised)] p-6 text-center">
                                        <History className="mx-auto h-7 w-7 text-app-soft" />
                                        <p className="mt-3 text-sm text-app-muted">Nenhum giro registrado.</p>
                                    </div>
                                ) : recentSpins.map((spin) => (
                                    <div key={spin.id} className="flex items-center justify-between gap-4 border-b border-[var(--line)] bg-[var(--paper-raised)] px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {spin.bonus_spin_awarded
                                                ? <RefreshCw className="h-4 w-4 text-[var(--accent)]" />
                                                : spin.coins_awarded > 0
                                                    ? <Gift className="h-4 w-4 text-[var(--success)]" />
                                                    : <X className="h-4 w-4 text-app-soft" />}
                                            <span className="text-sm font-semibold text-app">
                                                {spin.bonus_spin_awarded
                                                    ? 'Giro novamente'
                                                    : spin.coins_awarded > 0
                                                        ? `+${spin.coins_awarded.toLocaleString('pt-BR')} moedas`
                                                        : 'Sem prêmio'}
                                            </span>
                                        </div>
                                        <span className="technical-label shrink-0">{spin.created_at}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
