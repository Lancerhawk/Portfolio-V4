import { useEffect, useRef } from 'react';

export function useHeroPhotoTilt() {
    const photoRef = useRef(null);
    const tiltedRef = useRef(false);

    useEffect(() => {
        const photo = photoRef.current;
        if (!photo) return;

        const onScroll = () => {
            if (!tiltedRef.current && window.scrollY > 5) {
                photo.classList.add('tilted');
                tiltedRef.current = true;
                // Only needed once — remove listener after first trigger
                window.removeEventListener('scroll', onScroll);
            }
        };
        const onEnter = () => photo.classList.remove('tilted');
        const onLeave = () => { if (tiltedRef.current) photo.classList.add('tilted'); };

        window.addEventListener('scroll', onScroll, { passive: true });
        photo.addEventListener('mouseenter', onEnter);
        photo.addEventListener('mouseleave', onLeave);
        return () => {
            window.removeEventListener('scroll', onScroll);
            photo.removeEventListener('mouseenter', onEnter);
            photo.removeEventListener('mouseleave', onLeave);
        };
    }, []);

    return photoRef;
}
