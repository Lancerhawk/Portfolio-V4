import { useEffect, useRef } from 'react';

export function useLanguageStars() {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const items = container.querySelectorAll('.lang-item');

        const revealItem = (item) => {
            const stars = item.querySelectorAll('.language-star');
            stars.forEach((star, i) => {
                setTimeout(() => star.classList.add('visible'), i * 120);
            });
        };

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        revealItem(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.3 }
        );

        items.forEach(item => observer.observe(item));

        return () => observer.disconnect();
    }, []);

    return containerRef;
}
