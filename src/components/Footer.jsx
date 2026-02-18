import data from '../data/portfolio.json';

export default function Footer() {
    const f = data.footer;
    const scrollTo = (href) => {
        const id = href.replace('#', '');
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <footer style={{
            marginTop: '3rem', padding: '2rem 2rem 1.5rem',
            background: 'var(--white)', borderTop: 'var(--border-width) solid var(--border)',
            transition: 'all 0.3s ease'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Main row */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    gap: '2rem', flexWrap: 'wrap', paddingBottom: '1.5rem',
                    borderBottom: 'var(--border-width) solid var(--border)'
                }}>
                    {/* Brand */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <strong style={{ fontSize: '1.1rem', fontWeight: 700 }}>{data.meta.name}</strong>
                        <span style={{ fontSize: '0.875rem', opacity: 0.7 }}>{f.role}</span>
                    </div>

                    {/* Nav links */}
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        {f.navLinks.map(link => (
                            <button key={link.label} onClick={() => scrollTo(link.href)}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    fontFamily: 'inherit', fontWeight: 600, fontSize: '0.9rem',
                                    color: 'var(--text)', opacity: 0.8, transition: 'all 0.2s ease', padding: 0
                                }}
                                onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = 'var(--primary)'; }}
                                onMouseLeave={e => { e.currentTarget.style.opacity = '0.8'; e.currentTarget.style.color = 'var(--text)'; }}
                            >{link.label}</button>
                        ))}
                    </div>

                    {/* Social icons */}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {f.socials.map(s => (
                            <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                                title={s.label}
                                style={{
                                    width: '40px', height: '40px', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', background: 'var(--white)',
                                    border: 'var(--border-width) solid var(--border)', borderRadius: '6px',
                                    color: 'var(--text)', fontSize: '1.1rem', textDecoration: 'none',
                                    boxShadow: '2px 2px 0 0 var(--border)', transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = '0 0 0 var(--border)'; e.currentTarget.style.background = 'var(--primary)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '2px 2px 0 0 var(--border)'; e.currentTarget.style.background = 'var(--white)'; }}
                            ><i className={s.icon} /></a>
                        ))}
                    </div>
                </div>

                {/* Bottom row */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingTop: '1.5rem', flexWrap: 'wrap', gap: '1rem'
                }}>
                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.85rem', opacity: 0.7 }}>
                        {f.copyright}
                    </span>
                    <a href={f.terminalLink}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.5rem 1rem', background: 'var(--cyan)',
                            color: 'var(--text)', textDecoration: 'none',
                            border: 'var(--border-width) solid var(--border)', borderRadius: '6px',
                            boxShadow: '3px 3px 0 0 var(--border)', fontWeight: 600, fontSize: '0.85rem',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translate(3px,3px)'; e.currentTarget.style.boxShadow = '0 0 0 var(--border)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '3px 3px 0 0 var(--border)'; }}
                    >
                        <i className="fas fa-terminal" /> Open Terminal
                    </a>
                </div>
            </div>
        </footer>
    );
}
