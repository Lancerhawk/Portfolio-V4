import { useEffect, useRef } from 'react';

export function useFadeIn() {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('fade-in'); }),
            { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return ref;
}
