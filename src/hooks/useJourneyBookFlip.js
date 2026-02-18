import { useEffect, useRef } from 'react';

export function useJourneyBookFlip() {
    const timelineRef = useRef(null);
    const backRef = useRef(null);

    useEffect(() => {
        const timeline = timelineRef.current;
        const back = backRef.current;
        if (!timeline || !back) return;
        if (window.innerWidth < 769) return;

        const open = () => {
            timeline.style.transition = 'transform 0.6s ease';
            back.style.transition = 'transform 0.6s ease';
            timeline.style.transform = 'rotateY(0deg)';
            back.style.transform = 'rotateY(0deg)';
            timeline.style.zIndex = '100';
            back.style.zIndex = '1';
            setTimeout(() => { timeline.style.overflowY = 'auto'; }, 600);
        };

        const close = () => {
            timeline.style.transition = 'transform 0.4s ease';
            back.style.transition = 'transform 0.4s ease';
            timeline.style.transform = 'rotateY(180deg)';
            back.style.transform = 'rotateY(180deg)';
            timeline.style.zIndex = '1';
            back.style.zIndex = '100';
            timeline.style.overflowY = 'hidden';
        };

        // Start closed
        close();

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        open();
                    } else {
                        close();
                    }
                });
            },
            { threshold: 0.2 }
        );

        observer.observe(timeline);

        return () => observer.disconnect();
    }, []);

    return { timelineRef, backRef };
}
