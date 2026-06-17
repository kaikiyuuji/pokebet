import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start rounded border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-yellow-300 bg-white text-red-700 focus:border-yellow-300 focus:bg-white'
                    : 'border-transparent text-white/85 hover:border-yellow-200 hover:bg-white/10 hover:text-white focus:border-yellow-200 focus:bg-white/10 focus:text-white'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
