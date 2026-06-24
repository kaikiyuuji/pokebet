import { useSoundControls } from '@/Components/SoundProvider';
import { Volume2, VolumeX } from 'lucide-react';

export default function SoundToggle({ className = 'h-[38px] w-[38px]' }) {
    const { isMuted, toggleSound } = useSoundControls();

    return (
        <button
            type="button"
            onClick={toggleSound}
            className={`theme-toggle ${className}`}
            aria-label={isMuted ? 'Ativar sons e música' : 'Silenciar sons e música'}
            title={isMuted ? 'Ativar áudio' : 'Silenciar áudio'}
            data-sound="none"
        >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
    );
}
