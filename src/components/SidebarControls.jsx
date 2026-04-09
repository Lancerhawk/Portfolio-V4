import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useControls } from '../context/ControlContext';
import AIAssistantModal from './AIAssistantModal';
import './SidebarControls.css';

export default function SidebarControls() {
    const { cycleVibe } = useControls();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [aiOpen, setAiOpen] = useState(false);
    const location = useLocation();

    const isTerminal = location.pathname === '/terminal';

    if (isTerminal) return null;

    return (
        <>
            <AIAssistantModal isOpen={aiOpen} onClose={() => setAiOpen(false)} />

            <div className={`desk-sidebar-container desk-only`}>
                <button className="sidebar-btn" onClick={() => setAiOpen(true)}>
                    <span className="btn-label">AI ASSISTANT</span>
                    <div className="btn-indicator" style={{ background: 'var(--accent)' }} />
                </button>

                <button
                    className="sidebar-btn"
                    onClick={cycleVibe}
                >
                    <span className="btn-label">VIBE CHECK</span>
                    <div className="btn-indicator" style={{ background: 'var(--accent)' }} />
                </button>
            </div>

            <div className="mobile-sidebar-trigger md:hidden">
                <button
                    className={`mobile-fab ${mobileOpen ? 'open' : ''}`}
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    <i className={`fas ${mobileOpen ? 'fa-times' : 'fa-cog'}`} />
                </button>
            </div>

            <div className={`mobile-controls-drawer md:hidden ${mobileOpen ? 'open' : ''}`}>
                <h3>CONTROLS</h3>
                <div className="drawer-actions">
                    <button className="drawer-btn" onClick={() => { setAiOpen(true); setMobileOpen(false); }}>
                        AI ASSISTANT
                    </button>
                    <button className="drawer-btn" onClick={cycleVibe}>
                        VIBE CHECK
                    </button>
                </div>
            </div>

            {mobileOpen && (
                <div className="mobile-overlay md:hidden" onClick={() => setMobileOpen(false)} />
            )}
        </>
    );
}
