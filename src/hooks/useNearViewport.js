import { useEffect, useRef, useState } from 'react';

export function useNearViewport(rootMargin = '400px') {
    const ref = useRef(null);
    const [isNear, setIsNear] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el || isNear) return;
        const observer = new IntersectionObserver(entries => {
            if (entries.some(e => e.isIntersecting)) setIsNear(true);
        }, { rootMargin });
        observer.observe(el);
        return () => observer.disconnect();
    }, [isNear, rootMargin]);

    return [ref, isNear];
}
