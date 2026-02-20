import React, { useState, useEffect, useRef } from 'react';
import { ControlContext } from './ControlContext';

export const ControlProvider = ({ children }) => {
    const [isPhysics, setIsPhysics] = useState(false);
    const [isMuted, setIsMuted] = useState(() => localStorage.getItem('isMuted') === 'true');
    const [vibe, setVibe] = useState(() => localStorage.getItem('vibe') || 'default');
    const [showNotification, setShowNotification] = useState(false);
    const [notificationKey, setNotificationKey] = useState(0);
    // Initialize to current vibe so first effect run (page load) is always skipped
    const prevVibe = useRef(localStorage.getItem('vibe') || 'default');

    const vibes = ['default', 'neon', 'retro', 'minimal'];

    // Persistence
    useEffect(() => {
        localStorage.setItem('isMuted', isMuted);
    }, [isMuted]);

    useEffect(() => {
        localStorage.setItem('vibe', vibe);
        document.documentElement.setAttribute('data-vibe', vibe);

        // If the vibe hasn't changed from what was persisted/last set, skip.
        // This handles both the page-load case (prevVibe starts at the stored value)
        // and React StrictMode's double-invocation in dev.
        if (prevVibe.current === vibe) return;
        prevVibe.current = vibe;

        // Increment key to force the toast to fully remount (restarts all CSS animations)
        setNotificationKey(k => k + 1);
        setShowNotification(true);

        const timer = setTimeout(() => setShowNotification(false), 3100);
        return () => clearTimeout(timer);
    }, [vibe]);

    // Actions
    const togglePhysics = () => setIsPhysics(prev => !prev);
    const toggleMute = () => setIsMuted(prev => !prev);
    const cycleVibe = () => {
        const currentIndex = vibes.indexOf(vibe);
        const nextIndex = (currentIndex + 1) % vibes.length;
        setVibe(vibes[nextIndex]);
    };

    return (
        <ControlContext.Provider value={{
            isPhysics,
            togglePhysics,
            isMuted,
            toggleMute,
            vibe,
            cycleVibe,
            showNotification,
            notificationKey,
        }}>
            {children}
        </ControlContext.Provider>
    );
};
