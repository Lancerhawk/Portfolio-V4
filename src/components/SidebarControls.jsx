import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useControls } from '../context/ControlContext';
import './SidebarControls.css';

export default function SidebarControls() {
    const { cycleVibe } = useControls();
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    const isTerminal = location.pathname === '/terminal';

    // Hide sidebar entirely on terminal route
    if (isTerminal) return null;

    return (
        <>
            {/* Desktop Vertical Sidebar */}
            <div className={`desk-sidebar-container desk-only ${isTerminal ? 'is-right' : ''}`}>
                {/* Future Feature Placeholders */}
                <button className="sidebar-btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                    <span className="btn-label">AI ASSISTANT</span>
                    <div className="btn-indicator" style={{ background: '#666' }} />
                </button>

                <button
                    className="sidebar-btn"
                    onClick={cycleVibe}
                >
                    <span className="btn-label">VIBE CHECK</span>
                    <div className="btn-indicator" style={{ background: 'var(--accent)' }} />
                </button>
            </div>

            {/* Mobile Control Trigger */}
            <div className="mobile-sidebar-trigger md:hidden">
                <button
                    className={`mobile-fab ${mobileOpen ? 'open' : ''}`}
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    <i className={`fas ${mobileOpen ? 'fa-times' : 'fa-cog'}`} />
                </button>
            </div>

            {/* Mobile Drawer */}
            <div className={`mobile-controls-drawer md:hidden ${mobileOpen ? 'open' : ''}`}>
                <h3>CONTROLS</h3>
                <div className="drawer-actions">
                    {/* Placeholder Mobile Buttons */}
                    <button className="drawer-btn" onClick={cycleVibe}>
                        VIBE CHECK
                    </button>
                    <button className="drawer-btn" disabled style={{ opacity: 0.5 }}>
                        AI ASSISTANT (COMING SOON)
                    </button>
                </div>
            </div>

            {/* Overlay for mobile drawer */}
            {mobileOpen && (
                <div className="mobile-overlay md:hidden" onClick={() => setMobileOpen(false)} />
            )}
        </>
    );
}
