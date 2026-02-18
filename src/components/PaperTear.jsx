import { usePaperTearParallax } from '../hooks/usePaperTearParallax';

// Simple seeded random to ensure consistent tear shape (avoids hydration mismatches)
const seededRandom = (seed) => {
    const m = 0x80000000;
    const a = 1103515245;
    const c = 12345;
    let state = seed ? seed : Math.floor(Math.random() * (m - 1));
    return () => {
        state = (a * state + c) % m;
        return state / (m - 1);
    }
};

const generateJaggedPath = (width, height, seed = 123) => {
    const random = seededRandom(seed);
    const points = [];
    const segments = Math.ceil(width / 8); // ~8px per segment for small details
    const segmentWidth = width / segments;

    // Start at middle-ish
    let currentY = height / 2;

    for (let i = 0; i <= segments; i++) {
        const x = i * segmentWidth;
        // Small variations: +/- 3px
        // Keep within bounds (20% to 80% of height) to allow room for outline stroke
        const variation = (random() - 0.5) * 6;
        currentY = Math.max(5, Math.min(height - 5, (height / 2) + variation));

        points.push(`L${x.toFixed(1)},${currentY.toFixed(1)}`);
    }

    return `M0,${(height / 2).toFixed(1)} ${points.join(' ')}`;
}

// Generate jagged path once
// Starting at x=0 and going to x=1440
const wavePathRaw = generateJaggedPath(1440, 30);

export default function PaperTear() {
    const { gapRef, tearBottomRef, stickerRef, grayPathRef, grayPathBottomRef } = usePaperTearParallax();

    return (
        <>
            {/* Top tear - white to gray */}
            <div className="paper-tear-top" style={{ display: 'block', lineHeight: 0, marginBottom: '-1px' }}>
                <svg viewBox="0 0 1440 30" preserveAspectRatio="none" style={{ width: '100%', height: '30px', display: 'block' }}>
                    {/* Upper part (White) */}
                    <path d={`${wavePathRaw} L1440,0 L0,0 Z`} fill="var(--white)" className="paper-tear-white" />
                    {/* Lower part (Gray) */}
                    <path ref={grayPathRef} d={`${wavePathRaw} L1440,30 L0,30 Z`} fill="#d0d0d0" className="paper-tear-gray" />
                    {/* Outline */}
                    <path d={wavePathRaw} fill="none" stroke="var(--border)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
                </svg>
            </div>

            {/* Gap */}
            <div ref={gapRef} className="page-gap" style={{ height: '300px' }} />

            {/* Bottom tear - gray to white */}
            <div ref={tearBottomRef} style={{ display: 'block', lineHeight: 0, marginTop: '0px', marginBottom: '-1px', position: 'relative' }}>
                <svg viewBox="0 0 1440 30" preserveAspectRatio="none" style={{ width: '100%', height: '30px', display: 'block' }}>
                    {/* Upper part (Gray) */}
                    <path ref={grayPathBottomRef} d={`${wavePathRaw} L1440,0 L0,0 Z`} fill="#d0d0d0" className="paper-tear-gray" />
                    {/* Lower part (White) */}
                    <path d={`${wavePathRaw} L1440,30 L0,30 Z`} fill="var(--white)" className="paper-tear-white" />
                    {/* Outline */}
                    <path d={wavePathRaw} fill="none" stroke="var(--border)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
                </svg>

                {/* Tape sticker */}
                <div ref={stickerRef} className="tear-tape-sticker" />
            </div>
        </>
    );
}
