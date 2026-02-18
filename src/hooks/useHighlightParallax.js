import { useEffect, useRef } from 'react';

export function useHighlightParallax() {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const highlights = container.querySelectorAll('.highlight');
        const data = new Map();
        highlights.forEach((h, i) => {
            const dir = i % 2 === 0 ? 'left' : 'right';
            h.setAttribute('data-direction', dir);
            data.set(h, { hasStarted: false, startScroll: 0, duration: 100 });
        });

        let rafId = null;
        let lastScrollY = -1;

        const compute = (scrollY) => {
            const wh = window.innerHeight;
            highlights.forEach(h => {
                const rect = h.getBoundingClientRect();
                const top = rect.top + scrollY;
                const d = data.get(h);
                if (!d.hasStarted && scrollY + wh * 0.8 >= top) { d.hasStarted = true; d.startScroll = scrollY; }
                if (d.hasStarted) {
                    const p = Math.min(1, Math.max(0, (scrollY - d.startScroll) / d.duration));
                    h.style.setProperty('--highlight-progress', `${p * 100}%`);
                }
                if (d.hasStarted && scrollY < d.startScroll - 50) { d.hasStarted = false; h.style.setProperty('--highlight-progress', '0%'); }
            });
        };

        const onScroll = () => {
            const scrollY = window.scrollY;
            if (scrollY === lastScrollY) return;
            lastScrollY = scrollY;
            if (rafId) return;
            rafId = requestAnimationFrame(() => {
                rafId = null;
                compute(lastScrollY);
            });
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        requestAnimationFrame(() => compute(window.scrollY));
        return () => {
            window.removeEventListener('scroll', onScroll);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, []);

    return containerRef;
}
