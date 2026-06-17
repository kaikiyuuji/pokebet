import { useEffect, useState } from 'react';

const THEME_KEY = 'pokebet-theme';

function getInitialTheme() {
    if (typeof window === 'undefined') return 'light';

    const stored = window.localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useThemeMode() {
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        window.localStorage.setItem(THEME_KEY, theme);
    }, [theme]);

    return {
        theme,
        isDark: theme === 'dark',
        toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    };
}
