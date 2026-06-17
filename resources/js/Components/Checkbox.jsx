export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-app bg-app-surface text-red-600 shadow-sm focus:ring-red-500 ' +
                className
            }
        />
    );
}
