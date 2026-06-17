import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-red-500 text-app focus:border-red-700'
                    : 'border-transparent text-app-muted hover:border-red-300 hover:text-app focus:border-red-300 focus:text-app') +
                className
            }
        >
            {children}
        </Link>
    );
}
