import { useState, useEffect } from 'react';
import data from '../data/portfolio.json';

export default function Navbar({ theme, toggleTheme }) {
    const [hidden, setHidden] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    // Scroll hide/show
    useEffect(() => {
        let last = 0;
        const onScroll = () => {
            const current = window.scrollY;
            setHidden(current > last && current > 100);
            last = current;
            if (menuOpen) setMenuOpen(false);
        };
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, [menuOpen]);

    const scrollTo = (href) => {
        const id = href.replace('#', '');
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        setMenuOpen(false);
    };

    return (
        <nav style={{
            position: 'sticky', top: 0, zIndex: 1000,
            background: 'var(--white)', borderBottom: 'var(--border-width) solid var(--border)',
            boxShadow: '0 4px 0 var(--border)',
            transition: 'transform 0.3s ease',
            transform: hidden ? 'translateY(-120%)' : 'translateY(0)'
        }}>
            {/* Main bar */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1rem 1.5rem 1rem 1.5rem', flexWrap: 'nowrap', gap: '1rem'
            }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <span style={{ fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.5px' }}>
                        {data.meta.brand}
                    </span>
                    <a href={data.hero.RootlyRuntime?.url} target="_blank" rel="noopener noreferrer"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.3rem 0.65rem', background: 'var(--yellow)',
                            border: '2px solid var(--border)', boxShadow: '2px 2px 0 var(--border)',
                            textDecoration: 'none', color: 'var(--text)', fontWeight: 600, fontSize: '0.75rem',
                            transition: 'all 0.2s', whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = '0 0 0 var(--border)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)'; }}
                    >
                        <i className="fas fa-fire" /> Rootly-Runtime
                    </a>
                </div>

                {/* Desktop nav links */}
                <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'nowrap' }}>
                    {data.footer.navLinks.map(link => (
                        <button key={link.label} onClick={() => scrollTo(link.href)}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontFamily: 'inherit', fontWeight: 600, fontSize: '0.9rem',
                                color: 'var(--text)', opacity: 0.8, transition: 'opacity 0.2s', padding: 0
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
                        >{link.label}</button>
                    ))}
                    <button onClick={() => scrollTo('#contact')}
                        style={{
                            padding: '0.45rem 1rem', background: 'var(--cyan)',
                            border: '2px solid var(--border)', boxShadow: '3px 3px 0 var(--border)',
                            cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.85rem',
                            color: 'var(--text)', transition: 'all 0.2s', whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = '1px 1px 0 var(--border)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '3px 3px 0 var(--border)'; }}
                    >Get in Touch!</button>
                    <button onClick={toggleTheme}
                        style={{
                            width: '38px', height: '38px', background: 'var(--white)',
                            border: '2px solid var(--border)', boxShadow: '3px 3px 0 var(--border)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1rem', transition: 'all 0.2s', color: 'var(--text)', flexShrink: 0
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = '1px 1px 0 var(--border)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '3px 3px 0 var(--border)'; }}
                        title="Toggle theme"
                    >
                        <i className={theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'} />
                    </button>
                </div>

                {/* Mobile: theme + hamburger */}
                <div className="nav-mobile" style={{ display: 'none', alignItems: 'center', gap: '0.5rem' }}>
                    <button onClick={toggleTheme}
                        style={{
                            width: '36px', height: '36px', background: 'var(--white)',
                            border: '2px solid var(--border)', boxShadow: '2px 2px 0 var(--border)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1rem', color: 'var(--text)'
                        }}
                    ><i className={theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'} /></button>
                    <button onClick={() => setMenuOpen(o => !o)}
                        style={{
                            width: '36px', height: '36px', background: menuOpen ? 'var(--yellow)' : 'var(--white)',
                            border: '2px solid var(--border)', boxShadow: '2px 2px 0 var(--border)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.1rem', color: 'var(--text)', transition: 'background 0.2s'
                        }}
                    ><i className={menuOpen ? 'fas fa-times' : 'fas fa-bars'} /></button>
                </div>
            </div>

            {/* Mobile dropdown menu */}
            {menuOpen && (
                <div style={{
                    borderTop: '2px solid var(--border)', background: 'var(--white)',
                    padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem'
                }}>
                    {data.footer.navLinks.map(link => (
                        <button key={link.label} onClick={() => scrollTo(link.href)}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontFamily: 'inherit', fontWeight: 600, fontSize: '1rem',
                                color: 'var(--text)', textAlign: 'left', padding: '0.5rem 0',
                                borderBottom: '1px solid var(--border)', opacity: 0.85
                            }}
                        >{link.label}</button>
                    ))}
                    <button onClick={() => scrollTo('#contact')}
                        style={{
                            padding: '0.65rem 1rem', background: 'var(--cyan)',
                            border: '2px solid var(--border)', boxShadow: '3px 3px 0 var(--border)',
                            cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '1rem',
                            color: 'var(--text)', marginTop: '0.25rem'
                        }}
                    >Get in Touch!</button>
                </div>
            )}
        </nav>
    );
}
