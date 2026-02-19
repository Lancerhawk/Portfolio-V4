import { useEffect, useRef } from 'react';

export function usePaperTearParallax() {
    const gapRef = useRef(null);
    const tearBottomRef = useRef(null);
    const stickerRef = useRef(null);
    const grayPathRef = useRef(null);
    const grayPathBottomRef = useRef(null);

    useEffect(() => {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) return;

        const minGapHeight = -30;
        const initialGapHeight = 300;
        const scrollStart = 100;
        const scrollRange = 200;
        const stickerDelay = 30;
        const stickerStart = scrollStart + scrollRange + stickerDelay;
        const stickerRange = 60;

        const gap = gapRef.current;
        const tearBottom = tearBottomRef.current;
        const sticker = stickerRef.current;
        const grayPath = grayPathRef.current;
        const grayPathBottom = grayPathBottomRef.current;

        if (!gap || !tearBottom) return;

        let rafId = null;
        let lastScrollY = -1;
        let isVisible = false;
        let lockState = null; // 'start' | 'end' | null

        // Promote to compositor layers
        gap.style.willChange = 'height';
        tearBottom.style.willChange = 'margin-top';
        if (grayPath) grayPath.style.willChange = 'opacity';
        if (grayPathBottom) grayPathBottom.style.willChange = 'opacity';
        if (sticker) sticker.style.willChange = 'transform, opacity';
        if (sticker) sticker.style.contain = 'layout style paint';

        const applyStyles = (
            gapHeight, tearMargin, grayOpacity, stickerTransform, stickerOpacity, stateKey
        ) => {
            // Prevent redundant writes if we are already locked in this visual state
            if (stateKey && lockState === stateKey) return;
            lockState = stateKey;

            if (gapHeight !== null) gap.style.height = gapHeight + 'px';
            if (tearMargin !== null) tearBottom.style.marginTop = tearMargin + 'px';

            if (grayOpacity !== null) {
                const opStr = String(grayOpacity);
                if (grayPath) grayPath.style.opacity = opStr;
                if (grayPathBottom) grayPathBottom.style.opacity = opStr;
            }
            if (sticker) {
                if (stickerTransform !== null) sticker.style.transform = stickerTransform;
                if (stickerOpacity !== null) sticker.style.opacity = String(stickerOpacity);
            }
        };

        const compute = (scrollY) => {
            if (scrollY <= scrollStart) {
                applyStyles(
                    initialGapHeight, 0, 1,
                    'rotate(-8deg) translateY(-40px) translateZ(30px) rotateX(35deg)', 0,
                    'start'
                );
            } else if (scrollY >= stickerStart + stickerRange) {
                applyStyles(
                    0, minGapHeight, 0,
                    'rotate(-8deg) translateY(0px) translateZ(0px) rotateX(0deg)', 1,
                    'end'
                );
            } else if (scrollY > scrollStart && scrollY < stickerStart + stickerRange) {
                lockState = null; // Unlock when in transition range

                if (scrollY <= scrollStart + scrollRange) {
                    const progress = (scrollY - scrollStart) / scrollRange;
                    const currentHeight = initialGapHeight - (initialGapHeight - minGapHeight) * progress;

                    if (currentHeight >= 0) {
                        applyStyles(
                            currentHeight, 0, 1,
                            'rotate(-8deg) translateY(-100px) translateZ(50px) rotateX(45deg)', 0,
                            null
                        );
                    } else {
                        const negProgress = Math.abs(currentHeight) / Math.abs(minGapHeight);
                        applyStyles(
                            0, currentHeight, 1 - negProgress,
                            'rotate(-8deg) translateY(-100px) translateZ(50px) rotateX(45deg)', 0,
                            null
                        );
                    }
                } else if (scrollY > stickerStart) {
                    const sp = (scrollY - stickerStart) / stickerRange;
                    const ty = -40 + 40 * sp;
                    const tz = 30 - 30 * sp;
                    const rx = 35 - 35 * sp;
                    const op = sp < 0.35 ? 0 : sp > 1 ? 1 : (sp - 0.35) * 1.54;
                    applyStyles(
                        0, minGapHeight, 0,
                        `rotate(-8deg) translateY(${ty}px) translateZ(${tz}px) rotateX(${rx}deg)`,
                        op,
                        null
                    );
                } else {
                    // Plateau between range and sticker
                    applyStyles(
                        0, minGapHeight, 0,
                        'rotate(-8deg) translateY(-40px) translateZ(30px) rotateX(35deg)', 0,
                        'plateau'
                    );
                }
            }
        };

        const onScroll = () => {
            // OPTIMIZATION 1: If the component isn't in viewport, don't even read scrollY
            if (!isVisible) return;

            const scrollY = window.scrollY;
            if (scrollY === lastScrollY) return;
            lastScrollY = scrollY;

            // OPTIMIZATION 2: Don't compute if we are deep past the entire animation zone
            // and we already hit the 'end' lock state.
            if (scrollY > stickerStart + stickerRange + 500 && lockState === 'end') return;

            if (rafId) return;
            rafId = requestAnimationFrame(() => {
                rafId = null;
                compute(lastScrollY);
            });
        };

        // OPTIMIZATION 3: Intersection Observer to enable/disable scroll tracking
        const observer = new IntersectionObserver((entries) => {
            isVisible = entries[0].isIntersecting;
            if (isVisible) {
                // Kick off initial render when entering viewport
                requestAnimationFrame(() => compute(window.scrollY));
            }
        }, { threshold: 0, rootMargin: '200px' }); // Margin helps it start slightly before entry

        observer.observe(gap);

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', () => compute(window.scrollY), { passive: true });

        // Initial setup
        compute(window.scrollY);

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', onScroll);
            if (rafId) cancelAnimationFrame(rafId);
            // Cleanup styles to avoid memory leaks or visual glitches on re-renders
            gap.style.willChange = '';
            tearBottom.style.willChange = '';
            if (grayPath) grayPath.style.willChange = '';
            if (grayPathBottom) grayPathBottom.style.willChange = '';
            if (sticker) { sticker.style.willChange = ''; sticker.style.contain = ''; }
        };
    }, []);

    return { gapRef, tearBottomRef, stickerRef, grayPathRef, grayPathBottomRef };
}