import { useEffect, useRef, useState } from 'react';
import data from '../data/portfolio.json';

export default function ProgressBar() {
    const [progress, setProgress] = useState(0);
    const [activeSection, setActiveSection] = useState(0);

    useEffect(() => {
        const update = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);

            const sections = data.progressSections;
            let active = 0;
            sections.forEach((id, i) => {
                const el = document.getElementById(id);
                if (el && window.scrollY >= el.offsetTop - 200) active = i;
            });
            setActiveSection(active);
        };
        window.addEventListener('scroll', update);
        return () => window.removeEventListener('scroll', update);
    }, []);

    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, height: '6px',
            background: 'var(--white)', borderBottom: '2px solid var(--border)',
            zIndex: 9999, display: 'flex', alignItems: 'center'
        }}>
            <div style={{
                height: '100%', background: 'var(--secondary)',
                width: `${progress}%`, transition: 'width 0.1s ease',
                borderRight: '2px solid var(--border)'
            }} />
            {/* Checkpoints */}
            {data.progressSections.map((id, i) => {
                const pct = (i / (data.progressSections.length - 1)) * 100;
                return (
                    <button key={id} onClick={() => scrollTo(id)} title={data.progressLabels[i]}
                        style={{
                            position: 'absolute', left: `${pct}%`,
                            width: i === activeSection ? '18px' : '14px',
                            height: i === activeSection ? '18px' : '14px',
                            background: i <= activeSection ? 'var(--secondary)' : 'var(--white)',
                            border: '3px solid var(--border)', borderRadius: '50%',
                            cursor: 'pointer', top: '50%', transform: 'translateX(-50%) translateY(-50%)',
                            transition: 'all 0.3s ease', zIndex: 10,
                            boxShadow: i === activeSection ? '3px 3px 0 var(--border)' : '2px 2px 0 var(--border)'
                        }}
                    />
                );
            })}
        </div>
    );
}
