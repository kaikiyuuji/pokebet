import { Link } from '@inertiajs/react';

export default function BrandMark({ href = '/', compact = false, inverse = false }) {
    return (
        <Link href={href} className="group flex min-w-0 items-center gap-3" aria-label="PokeBet">
            <span className="brand-mark" aria-hidden="true">PB</span>
            {!compact && (
                <span className="brand-copy min-w-0">
                    <span className={`block truncate text-sm font-bold leading-none tracking-[-0.03em] ${inverse ? 'text-white' : 'text-app'}`}>
                        PokeBet
                    </span>
                    <span className={`technical-label mt-1 block ${inverse ? '!text-white/60' : ''}`}>
                        Battle Lab / 2026
                    </span>
                </span>
            )}
        </Link>
    );
}
