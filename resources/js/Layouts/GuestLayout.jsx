import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-indigo-50 to-purple-50 pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/" className="flex flex-col items-center gap-1">
                    <span className="text-5xl">⚡</span>
                    <span className="text-xl font-bold text-indigo-700 tracking-tight">PokéBet</span>
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-6 shadow-md sm:max-w-md sm:rounded-xl border border-gray-100">
                {children}
            </div>
        </div>
    );
}
