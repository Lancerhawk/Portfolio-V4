import { useState, useEffect } from 'react';
import versions from '../data/versions.json';
import { useControls } from '../context/ControlContext';

export default function VersionHistory() {
    const [isOpen, setIsOpen] = useState(false);
    const { isMuted, toggleMute } = useControls();

    // Close modal on ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    return (
        <>
            {/* Mute Button */}
            <button
                onClick={toggleMute}
                className="mute-toggle-btn"
                title={isMuted ? "Unmute Sounds" : "Mute Sounds"}
                style={{
                    position: 'fixed',
                    bottom: '2.5rem',
                    right: '6.5rem',
                    zIndex: 1000,
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: isMuted ? 'var(--pink)' : 'var(--cyan)',
                    border: '3px solid var(--border)',
                    boxShadow: '4px 4px 0 var(--border)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    transition: 'all 0.2s ease',
                    color: isMuted ? 'var(--pink-content)' : 'var(--cyan-content)'
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translate(2px, 2px)';
                    e.currentTarget.style.boxShadow = '0 0 0 var(--border)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '4px 4px 0 var(--border)';
                }}
            >
                <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'}`} />
            </button>

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="version-history-btn"
                title="Version History"
                style={{
                    position: 'fixed',
                    bottom: '2.5rem',
                    right: '2.5rem',
                    zIndex: 1000,
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'var(--yellow)',
                    border: '3px solid var(--border)',
                    boxShadow: '4px 4px 0 var(--border)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    transition: 'all 0.2s ease',
                    color: 'var(--yellow-content)'
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translate(2px, 2px)';
                    e.currentTarget.style.boxShadow = '0 0 0 var(--border)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '4px 4px 0 var(--border)';
                }}
            >
                <i className="fas fa-history" />
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div
                    className="version-modal-overlay"
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000,
                        padding: '1rem',
                        backdropFilter: 'blur(4px)'
                    }}
                >
                    <div
                        className="version-modal"
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'var(--white)',
                            border: '4px solid var(--border)',
                            boxShadow: '12px 12px 0 var(--border)',
                            width: '100%',
                            maxWidth: '500px',
                            maxHeight: '80vh',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            animation: 'modalSlideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '1.5rem',
                            background: 'var(--cyan)',
                            borderBottom: '4px solid var(--border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--cyan-content)' }}>Version History</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{
                                    background: 'var(--pink)',
                                    border: '3px solid var(--border)',
                                    width: '35px',
                                    height: '35px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '3px 3px 0 var(--border)',
                                    transition: 'all 0.1s ease'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translate(2px, 2px)';
                                    e.currentTarget.style.boxShadow = '0 0 0 var(--border)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = '';
                                    e.currentTarget.style.boxShadow = '3px 3px 0 var(--border)';
                                }}
                            >
                                <i className="fas fa-times" style={{ color: 'var(--pink-content)' }} />
                            </button>
                        </div>

                        {/* Content */}
                        <div style={{
                            padding: '1.5rem',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2rem'
                        }}>
                            {versions.map((v, i) => (
                                <div key={v.version} style={{
                                    borderLeft: '4px solid var(--border)',
                                    paddingLeft: '1.5rem',
                                    position: 'relative'
                                }}>
                                    {/* Dot */}
                                    <div style={{
                                        position: 'absolute',
                                        left: '-11px',
                                        top: '0',
                                        width: '18px',
                                        height: '18px',
                                        background: i === 0 ? 'var(--yellow)' : 'var(--white)',
                                        border: '3px solid var(--border)',
                                        borderRadius: '50%'
                                    }} />

                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1rem' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>v{v.version}</h3>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', opacity: 0.7 }}>{v.date}</span>
                                    </div>

                                    {Object.entries(v.changes).map(([type, items]) => (
                                        <div key={type} style={{ marginBottom: '1rem' }}>
                                            <h4 style={{
                                                fontSize: '0.9rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '1px',
                                                marginBottom: '0.5rem',
                                                display: 'inline-block',
                                                padding: '0.2rem 0.5rem',
                                                background: type === 'Added' ? 'var(--accent)' : type === 'Fixed' ? 'var(--pink)' : 'var(--cyan)',
                                                color: type === 'Added' ? 'var(--accent-content)' : type === 'Fixed' ? 'var(--pink-content)' : 'var(--cyan-content)',
                                                border: '2px solid var(--border)',
                                                fontWeight: 700
                                            }}>{type}</h4>
                                            <ul style={{ margin: 0, paddingLeft: '1.1rem', listStyle: 'none' }}>
                                                {items.map((item, idx) => (
                                                    <li key={idx} style={{
                                                        fontSize: '0.9rem',
                                                        marginBottom: '0.4rem',
                                                        position: 'relative',
                                                        opacity: 0.9
                                                    }}>
                                                        <span style={{ position: 'absolute', left: '-1rem' }}>•</span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: '1rem 1.5rem',
                            borderTop: '4px solid var(--border)',
                            textAlign: 'center',
                            background: 'var(--white)'
                        }}>
                            <small style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                                Arin's Portfolio Evolution
                            </small>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
