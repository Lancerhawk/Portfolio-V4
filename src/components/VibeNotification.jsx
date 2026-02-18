import React from 'react';
import { useControls } from '../context/ControlContext';

export default function VibeNotification() {
    const { vibe, showNotification } = useControls();

    if (!showNotification) return null;

    const vibeNames = {
        default: 'Default Vibe',
        neon: 'Neon Pulse',
        retro: 'Retro Future',
        minimal: 'Clean Minimal'
    };

    return (
        <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10000,
            pointerEvents: 'none',
            animation: 'vibeIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards, vibeOut 0.5s 2.5s ease-in forwards'
        }}>
            <div style={{
                background: 'var(--white)',
                border: '4px solid var(--border)',
                padding: '1.5rem 3rem',
                boxShadow: '12px 12px 0 var(--border)',
                textAlign: 'center'
            }}>
                <div style={{
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '3px',
                    opacity: 0.7,
                    marginBottom: '0.5rem',
                    fontFamily: 'Space Mono, monospace'
                }}>
                    Vibe Switched To
                </div>
                <div style={{
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    color: 'var(--primary)',
                    letterSpacing: '-1px'
                }}>
                    {vibeNames[vibe] || vibe}
                </div>
            </div>
        </div>
    );
}
