import { useLocation } from 'react-router-dom';
import { useControls } from '../context/ControlContext';

const VIBE_CONFIG = {
    default: {
        label: 'Default',
        tag: 'Classic mode',
        icon: '◈',
        accent: 'var(--cyan)',
        accentText: 'var(--text)',
    },
    neon: {
        label: 'Neon Pulse',
        tag: 'Lights on',
        icon: '◉',
        accent: 'var(--primary)',
        accentText: '#000',
    },
    retro: {
        label: 'Retro Future',
        tag: 'Old school',
        icon: '▣',
        accent: 'var(--secondary)',
        accentText: 'var(--text)',
    },
    minimal: {
        label: 'Clean Minimal',
        tag: 'Less is more',
        icon: '□',
        accent: 'var(--border)',
        accentText: 'var(--white)',
    },
};

export default function VibeNotification() {
    const { vibe, showNotification, notificationKey } = useControls();
    const location = useLocation();

    if (!showNotification || location.pathname === '/terminal') return null;

    const config = VIBE_CONFIG[vibe] || VIBE_CONFIG.default;
    const letters = config.label.split('');

    return (
        <div key={notificationKey} className="vibe-toast-wrapper" role="status" aria-live="polite">
            <div className="vibe-toast">
                {/* Left accent bar */}
                <div
                    className="vibe-toast-bar"
                    style={{ background: config.accent }}
                />

                {/* Body */}
                <div className="vibe-toast-body">
                    {/* Top row */}
                    <div className="vibe-toast-top">
                        <span className="vibe-toast-eyebrow">VIBE SWITCHED</span>
                        <span
                            className="vibe-toast-icon"
                            style={{ color: config.accent }}
                        >
                            {config.icon}
                        </span>
                    </div>

                    {/* Animated vibe name */}
                    <div className="vibe-toast-name" aria-label={config.label}>
                        {letters.map((char, i) => (
                            <span
                                key={i}
                                className="vibe-letter"
                                style={{ animationDelay: `${i * 0.04}s` }}
                            >
                                {char === ' ' ? '\u00A0' : char}
                            </span>
                        ))}
                    </div>

                    {/* Tag */}
                    <div className="vibe-toast-tag">{config.tag}</div>

                    {/* Progress bar */}
                    <div className="vibe-toast-progress-track">
                        <div
                            className="vibe-toast-progress-fill"
                            style={{ background: config.accent }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
