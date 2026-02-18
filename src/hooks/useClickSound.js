import { useCallback, useRef } from 'react';

export function useClickSound() {
    const audioCtx = useRef(null);

    const playClick = useCallback(() => {
        try {
            if (!audioCtx.current) {
                audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
            }

            if (audioCtx.current.state === 'suspended') {
                audioCtx.current.resume();
            }

            const ctx = audioCtx.current;
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.type = 'square'; // Gives it a "techy/brutalist" sharp edge
            oscillator.frequency.setValueAtTime(800, ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.start();
            oscillator.stop(ctx.currentTime + 0.1);
        } catch (e) {
            console.error('Audio click failed', e);
        }
    }, []);

    return { playClick };
}
