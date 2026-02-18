import { useEffect, useState } from 'react';
import data from '../data/portfolio.json';

export default function LoaderOverlay() {
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setHidden(true), 1400);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`loader-overlay${hidden ? ' hidden' : ''}`}>
            {/* Floating shapes */}
            <svg className="loader-shape-svg loader-shape-1" width="80" height="80" viewBox="0 0 80 80">
                <rect x="10" y="10" width="60" height="60" fill="none" stroke="#000" strokeWidth="4" />
                <rect x="20" y="20" width="40" height="40" fill="#000" />
            </svg>
            <svg className="loader-shape-svg loader-shape-2" width="70" height="70" viewBox="0 0 70 70">
                <circle cx="35" cy="35" r="30" fill="none" stroke="#000" strokeWidth="4" />
                <circle cx="35" cy="35" r="15" fill="#000" />
            </svg>
            <svg className="loader-shape-svg loader-shape-3" width="60" height="60" viewBox="0 0 60 60">
                <polygon points="30,5 55,50 5,50" fill="none" stroke="#000" strokeWidth="4" />
                <polygon points="30,18 45,45 15,45" fill="#000" />
            </svg>

            {/* Initials */}
            <div style={{ display: 'flex', gap: '1.5rem' }}>
                {data.meta.initials.split('').map((letter, i) => (
                    <div key={i} className="loader-letter">{letter}</div>
                ))}
            </div>

            {/* Progress bar */}
            <div className="loader-progress-bar">
                <div className="loader-progress-fill" />
            </div>
        </div>
    );
}
