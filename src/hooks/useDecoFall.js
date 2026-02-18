import { useEffect, useRef } from 'react';

export function useDecoFall() {
    const terminalRef = useRef(null);
    const fallenRef = useRef(false);

    useEffect(() => {
        const terminal = terminalRef.current;
        const heroContent = document.querySelector('.hero-content');
        if (!terminal || !heroContent) return;

        const calcFall = () => {
            const heroRect = heroContent.getBoundingClientRect();
            const termRect = terminal.getBoundingClientRect();
            const dist = Math.max(0, heroRect.bottom - termRect.bottom - 50);
            terminal.style.setProperty('--fall-distance', `${dist}px`);
        };

        calcFall();
        window.addEventListener('resize', calcFall, { passive: true });

        const onScroll = () => {
            if (!fallenRef.current && window.scrollY > 5) {
                terminal.classList.add('falling');
                fallenRef.current = true;
                // One-time trigger — remove listener immediately
                window.removeEventListener('scroll', onScroll);
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('resize', calcFall);
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    return terminalRef;
}
