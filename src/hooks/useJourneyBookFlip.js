import { useEffect, useRef, useState } from 'react';

export function useJourneyBookFlip() {
    const leafRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const leaf = leafRef.current;
        if (!leaf) return;
        if (window.innerWidth < 769) return;

        // 'closed' | 'opening' | 'open' | 'closing'
        let state = 'closed';
        let debounceTimer = null;

        const open = () => {
            if (state === 'open' || state === 'opening') return;
            state = 'opening';
            leaf.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            leaf.style.transform = 'rotateY(0deg)';
            setIsOpen(true);
            setTimeout(() => {
                state = 'open';
                // Find timeline inside leaf to enable scrolling
                const timeline = leaf.querySelector('.journey-timeline');
                if (timeline) timeline.style.overflowY = 'auto';
            }, 600);
        };

        const close = () => {
            if (state === 'closed' || state === 'closing') return;
            state = 'closing';
            // Disable overflow immediately when closing
            const timeline = leaf.querySelector('.journey-timeline');
            if (timeline) timeline.style.overflowY = 'hidden';

            leaf.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            leaf.style.transform = 'rotateY(180deg)';
            setIsOpen(false);
            setTimeout(() => {
                state = 'closed';
            }, 400);
        };

        // Start closed at rotateY(180deg)
        leaf.style.transition = 'none';
        leaf.style.transform = 'rotateY(180deg)';
        state = 'closed';

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[entries.length - 1];
                const shouldOpen = entry.isIntersecting;

                if (debounceTimer) clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    debounceTimer = null;
                    if (shouldOpen) {
                        open();
                    } else {
                        close();
                    }
                }, 120);
            },
            { threshold: 0.2 }
        );

        observer.observe(leaf);

        return () => {
            observer.disconnect();
            if (debounceTimer) clearTimeout(debounceTimer);
        };
    }, []);

    return { leafRef, isOpen };
}