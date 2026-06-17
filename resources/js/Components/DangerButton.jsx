export default function DangerButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-lg border-2 border-red-900 bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-[3px_3px_0_#7f1d1d] transition duration-150 ease-in-out hover:-translate-y-0.5 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 active:translate-y-0 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
