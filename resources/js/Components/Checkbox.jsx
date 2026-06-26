export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'border-app bg-app-surface text-[var(--accent)] shadow-none focus:ring-[var(--accent)] ' +
                className
            }
        />
    );
}
