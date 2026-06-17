export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `btn-poke inline-flex items-center px-4 py-2 text-xs font-bold uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
