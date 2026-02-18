import { useMatrixTyping } from '../hooks/useMatrixTyping';
import { useHeroPhotoTilt } from '../hooks/useHeroPhotoTilt';
import { useDecoFall } from '../hooks/useDecoFall';
import data from '../data/portfolio.json';

export default function HeroSection() {
    useMatrixTyping('hero-greeting', data.hero.greeting, 600);
    const photoRef = useHeroPhotoTilt();
    const terminalRef = useDecoFall();

    return (
        <section id="hero" style={{ padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem) 0', position: 'relative', overflow: 'visible' }}>
            {/* Hero content grid */}
            <div className="hero-content hero-grid" style={{ position: 'relative' }}>
                {/* Left: text */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <p id="hero-greeting" style={{
                        fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 600, color: 'var(--cyan)', margin: 0,
                        fontFamily: 'Space Mono, monospace'
                    }}>{data.hero.greeting}</p>

                    <h1 style={{
                        fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700,
                        lineHeight: 1.1, margin: 0
                    }}>{data.hero.name}</h1>

                    <p style={{
                        fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', lineHeight: 1.7, color: 'var(--text)',
                        maxWidth: '600px', margin: 0, opacity: 0.85
                    }}>{data.hero.description}</p>

                    {/* Social buttons */}
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {data.hero.socials.map(s => (
                            <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                                title={s.label}
                                style={{
                                    width: '46px', height: '46px', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', background: 'var(--white)',
                                    border: '3px solid var(--border)', boxShadow: '4px 4px 0 var(--border)',
                                    color: 'var(--text)', fontSize: '1.2rem', textDecoration: 'none',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(4px,4px)'; e.currentTarget.style.boxShadow = '0 0 0 var(--border)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '4px 4px 0 var(--border)'; }}
                            ><i className={s.icon} /></a>
                        ))}

                        {/* Coffee CTA */}
                        <a href={data.hero.coffeeUrl} target="_blank" rel="noopener noreferrer"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.55rem 1rem', background: 'var(--yellow)',
                                border: '3px solid var(--border)', boxShadow: '4px 4px 0 var(--border)',
                                textDecoration: 'none', color: 'var(--text)', fontWeight: 700,
                                fontSize: '0.85rem', transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(4px,4px)'; e.currentTarget.style.boxShadow = '0 0 0 var(--border)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '4px 4px 0 var(--border)'; }}
                        >☕ {data.hero.coffeeText}</a>
                    </div>

                    {/* CTA button */}
                    <div>
                        <a href={data.hero.ctaLink}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.75rem 1.75rem', background: 'var(--cyan)',
                                border: '3px solid var(--border)', boxShadow: '5px 5px 0 var(--border)',
                                textDecoration: 'none', color: 'var(--text)', fontWeight: 700,
                                fontSize: '1rem', transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(5px,5px)'; e.currentTarget.style.boxShadow = '0 0 0 var(--border)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '5px 5px 0 var(--border)'; }}
                        >
                            <i className="fas fa-paper-plane" /> {data.hero.ctaText}
                        </a>
                    </div>
                </div>

                {/* Right: photo + deco (hidden on mobile via CSS) */}
                <div className="hero-photo-col" style={{ position: 'relative', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                    {/* Deco: code SVG */}
                    <div className="deco-code" style={{ position: 'absolute', top: '-40px', right: '-30px', zIndex: 5 }}>
                        <svg width="70" height="70" viewBox="0 0 80 80">
                            <rect x="5" y="5" width="70" height="70" rx="4" fill="var(--white)" stroke="var(--border)" strokeWidth="3" />
                            <rect x="5" y="5" width="70" height="18" rx="4" fill="var(--cyan)" stroke="var(--border)" strokeWidth="3" />
                            <circle cx="16" cy="14" r="4" fill="var(--border)" />
                            <circle cx="28" cy="14" r="4" fill="var(--border)" />
                            <circle cx="40" cy="14" r="4" fill="var(--border)" />
                            <rect x="12" y="30" width="25" height="4" rx="2" fill="var(--border)" opacity="0.5" />
                            <rect x="12" y="40" width="40" height="4" rx="2" fill="var(--border)" opacity="0.5" />
                            <rect x="12" y="50" width="30" height="4" rx="2" fill="var(--border)" opacity="0.5" />
                            <rect x="12" y="60" width="20" height="4" rx="2" fill="var(--border)" opacity="0.5" />
                        </svg>
                    </div>

                    {/* Deco: terminal SVG */}
                    <div ref={terminalRef} className="deco-terminal" style={{
                        position: 'absolute', bottom: '-20px', left: '-50px', zIndex: 5,
                        '--fall-distance': '200px'
                    }}>
                        <svg width="85" height="65" viewBox="0 0 90 70">
                            <rect x="3" y="3" width="84" height="64" rx="4" fill="var(--white)" stroke="var(--border)" strokeWidth="3" />
                            <rect x="3" y="3" width="84" height="18" rx="4" fill="var(--border)" />
                            <circle cx="15" cy="12" r="4" fill="var(--pink)" />
                            <circle cx="27" cy="12" r="4" fill="var(--yellow)" />
                            <circle cx="39" cy="12" r="4" fill="var(--accent)" />
                            <text x="10" y="38" fontFamily="monospace" fontSize="10" fill="var(--accent)">$ npm run dev</text>
                            <text x="10" y="52" fontFamily="monospace" fontSize="10" fill="var(--cyan)">▶ ready!</text>
                        </svg>
                    </div>

                    {/* Deco: floppy */}
                    <div className="deco-floppy" style={{
                        position: 'absolute', top: '50%', left: '-60px', zIndex: 5, transform: 'translateY(-50%)'
                    }}>
                        <svg width="48" height="52" viewBox="0 0 50 55">
                            <rect x="3" y="3" width="44" height="49" rx="2" fill="var(--yellow)" stroke="var(--border)" strokeWidth="3" />
                            <rect x="10" y="3" width="22" height="16" rx="1" fill="var(--white)" stroke="var(--border)" strokeWidth="2" />
                            <rect x="14" y="5" width="6" height="12" rx="1" fill="var(--border)" />
                            <rect x="8" y="28" width="34" height="20" rx="1" fill="var(--white)" stroke="var(--border)" strokeWidth="2" />
                            <circle cx="25" cy="38" r="5" fill="var(--border)" opacity="0.3" />
                        </svg>
                    </div>

                    {/* Photo */}
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%) rotate(-3deg)',
                            width: '80px', height: '25px', background: 'rgba(255,217,61,0.7)',
                            border: '2px solid rgba(0,0,0,0.1)', borderRadius: '2px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)', zIndex: 10
                        }} />
                        <img
                            ref={photoRef}
                            src={data.hero.photo}
                            alt={data.hero.photoAlt}
                            className="hero-photo"
                            style={{
                                width: 'clamp(200px, 30vw, 300px)',
                                height: 'clamp(200px, 30vw, 300px)',
                                objectFit: 'cover',
                                border: '4px solid var(--border)', boxShadow: '8px 8px 0 var(--border)',
                                display: 'block', position: 'relative', zIndex: 2
                            }}
                        />
                        <div style={{
                            position: 'absolute', bottom: '-15px', right: '-15px',
                            background: 'var(--yellow)', border: '3px solid var(--border)',
                            boxShadow: '4px 4px 0 var(--border)', padding: '0.4rem 0.8rem',
                            fontWeight: 700, fontSize: '0.8rem', zIndex: 3,
                            fontFamily: 'Space Mono, monospace', transform: 'rotate(-2deg)'
                        }}>{data.hero.decoLabel}</div>
                    </div>
                </div>
            </div>

            {/* Tech badges */}
            <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '0.6rem',
                marginTop: '2.5rem', paddingBottom: '2rem', justifyContent: 'center'
            }}>
                {data.hero.techBadges.map(b => (
                    <div key={b.label} style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.4rem 0.85rem', background: 'var(--white)',
                        border: '2px solid var(--border)', boxShadow: '3px 3px 0 var(--border)',
                        fontFamily: 'Space Mono, monospace', fontSize: '0.8rem', fontWeight: 600
                    }}>
                        <i className={b.icon} style={{ fontSize: '0.95rem' }} />
                        {b.label}
                    </div>
                ))}
            </div>
        </section>
    );
}
