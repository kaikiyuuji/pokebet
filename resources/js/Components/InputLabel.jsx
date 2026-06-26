export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `technical-label block text-app-muted ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
