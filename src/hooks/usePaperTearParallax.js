import { useEffect, useRef } from 'react';

export function usePaperTearParallax() {
    const gapRef = useRef(null);
    const tearBottomRef = useRef(null);
    const stickerRef = useRef(null);
    const grayPathRef = useRef(null);
    const grayPathBottomRef = useRef(null);

    useEffect(() => {
        const minGapHeight = -30;
        const initialGapHeight = 300;
        const scrollStart = 100;
        const scrollRange = 200;
        const stickerDelay = 30;
        const stickerStart = scrollStart + scrollRange + stickerDelay;
        const stickerRange = 60;

        let rafId = null;
        let lastScrollY = -1;


        const gap = gapRef.current;
        const tearBottom = tearBottomRef.current;
        const sticker = stickerRef.current;
        const grayPath = grayPathRef.current;
        const grayPathBottom = grayPathBottomRef.current;

        if (!gap || !tearBottom) return;

        // Promote animated elements to their own compositor layers up front.
        // This tells the GPU to keep these as separate textures so transforms
        // and opacity changes never trigger layout or paint — only compositing.
        gap.style.willChange = 'height';
        tearBottom.style.willChange = 'transform, margin-top';
        if (grayPath) grayPath.style.willChange = 'opacity';
        if (grayPathBottom) grayPathBottom.style.willChange = 'opacity';
        if (sticker) sticker.style.willChange = 'transform, opacity';

        // Limit layout/paint scope for the sticker to its own subtree.
        if (sticker) sticker.style.contain = 'layout style paint';



        // Batch all style writes into a single function so the browser can
        // compute layout once and repaint once per frame.
        const applyStyles = (
            gapHeight,       // number | null (null = skip)
            tearMargin,      // number | null
            grayOpacity,     // number | null
            stickerTransform, // string | null
            stickerOpacity   // number | null
        ) => {
            // All writes happen together — no interleaved reads that stall layout
            if (gapHeight !== null) gap.style.height = gapHeight + 'px';
            if (tearMargin !== null) tearBottom.style.marginTop = tearMargin + 'px';
            if (grayOpacity !== null) {
                if (grayPath) grayPath.style.opacity = String(grayOpacity);
                if (grayPathBottom) grayPathBottom.style.opacity = String(grayOpacity);
            }
            if (sticker) {
                // Update fixed-position top using cached offset instead of live rect
                /* sticker.style.top handled by CSS absolute positioning now */
                if (stickerTransform !== null) sticker.style.transform = stickerTransform;
                if (stickerOpacity !== null) sticker.style.opacity = String(stickerOpacity);
            }
        };

        const compute = (scrollY) => {
            if (scrollY <= scrollStart) {
                applyStyles(
                    initialGapHeight, 0, 1,
                    'rotate(-8deg) translateY(-40px) translateZ(30px) rotateX(35deg)', 0
                );
            } else if (scrollY <= scrollStart + scrollRange) {
                const progress = (scrollY - scrollStart) / scrollRange;
                const currentHeight = initialGapHeight - (initialGapHeight - minGapHeight) * progress;

                if (currentHeight >= 0) {
                    applyStyles(
                        currentHeight, 0, 1,
                        'rotate(-8deg) translateY(-100px) translateZ(50px) rotateX(45deg)', 0
                    );
                } else {
                    const negProgress = Math.abs(currentHeight) / Math.abs(minGapHeight);
                    applyStyles(
                        0, currentHeight, 1 - negProgress,
                        'rotate(-8deg) translateY(-100px) translateZ(50px) rotateX(45deg)', 0
                    );
                }
            } else if (scrollY > stickerStart && scrollY < stickerStart + stickerRange) {
                const sp = (scrollY - stickerStart) / stickerRange;
                const ty = -40 + 40 * sp;
                const tz = 30 - 30 * sp;
                const rx = 35 - 35 * sp;
                // clamp manually — faster than Math.min/max calls in hot path
                const op = sp < 0.35 ? 0 : sp > 1 ? 1 : (sp - 0.35) * 1.54;
                applyStyles(
                    0, minGapHeight, 0,
                    `rotate(-8deg) translateY(${ty}px) translateZ(${tz}px) rotateX(${rx}deg)`,
                    op
                );
            } else if (scrollY >= stickerStart + stickerRange) {
                applyStyles(
                    0, minGapHeight, 0,
                    'rotate(-8deg) translateY(0px) translateZ(0px) rotateX(0deg)', 1
                );
            } else {
                // Between scrollStart+scrollRange and stickerStart
                applyStyles(
                    0, minGapHeight, 0,
                    'rotate(-8deg) translateY(-40px) translateZ(30px) rotateX(35deg)', 0
                );
            }
        };

        const onScroll = () => {
            if (window.innerWidth <= 768) return;
            const scrollY = window.scrollY;
            if (scrollY === lastScrollY) return;
            lastScrollY = scrollY;
            if (rafId) return;
            rafId = requestAnimationFrame(() => {
                rafId = null;
                compute(lastScrollY);
            });
        };

        const onResize = () => {
            if (window.innerWidth <= 768) return;
            // Re-measure cached offset on resize since layout has changed
            compute(window.scrollY);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize, { passive: true });

        // Initial measure + render
        // Initial measure + render
        requestAnimationFrame(() => compute(window.scrollY));

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onResize);
            if (rafId) cancelAnimationFrame(rafId);
            // Clean up will-change to free compositor memory when component unmounts
            gap.style.willChange = '';
            tearBottom.style.willChange = '';
            if (grayPath) grayPath.style.willChange = '';
            if (grayPathBottom) grayPathBottom.style.willChange = '';
            if (sticker) { sticker.style.willChange = ''; sticker.style.contain = ''; }
        };
    }, []);

    return { gapRef, tearBottomRef, stickerRef, grayPathRef, grayPathBottomRef };
}