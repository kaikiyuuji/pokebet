import {
    getSoundMuted,
    setMusicTrack,
    setSoundMuted,
    sound,
    unlockAudio,
} from '@/hooks/useSound';
import { router } from '@inertiajs/react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const SoundContext = createContext({
    isMuted: false,
    toggleSound: () => {},
});

export function SoundProvider({ children, initialComponent }) {
    const [isMuted, setIsMuted] = useState(getSoundMuted);

    useEffect(() => {
        const applyTrack = (component) => {
            setMusicTrack(component === 'Battle/Show' ? 'battle' : 'ambient');
        };

        applyTrack(initialComponent);
        return router.on('navigate', (event) => applyTrack(event.detail.page.component));
    }, [initialComponent]);

    useEffect(() => {
        const unlock = () => unlockAudio();
        const playInterfaceSound = (event) => {
            const target = event.target.closest('button, a[href], [role="button"]');
            if (!target || target.dataset.sound === 'none' || target.matches(':disabled')) return;

            if (
                target.classList.contains('btn-poke') ||
                target.dataset.sound === 'confirm'
            ) {
                sound.confirm();
                return;
            }

            sound.click();
        };

        window.addEventListener('pointerdown', unlock, { once: true, capture: true });
        document.addEventListener('click', playInterfaceSound, true);

        return () => {
            window.removeEventListener('pointerdown', unlock, true);
            document.removeEventListener('click', playInterfaceSound, true);
        };
    }, []);

    const value = useMemo(() => ({
        isMuted,
        toggleSound: async () => {
            await unlockAudio();
            const nextMuted = !isMuted;
            setSoundMuted(nextMuted);
            setIsMuted(nextMuted);
            if (!nextMuted) sound.select();
        },
    }), [isMuted]);

    return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSoundControls() {
    return useContext(SoundContext);
}
