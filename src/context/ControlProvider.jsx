import React, { useState, useEffect } from 'react';
import { ControlContext } from './ControlContext';

export const ControlProvider = ({ children }) => {
    const [isPhysics, setIsPhysics] = useState(false);
    const [isMuted, setIsMuted] = useState(() => localStorage.getItem('isMuted') === 'true');
    const [vibe, setVibe] = useState(() => localStorage.getItem('vibe') || 'default');
    const [showNotification, setShowNotification] = useState(false);

    const vibes = ['default', 'neon', 'retro', 'minimal'];

    // Persistence
    useEffect(() => {
        localStorage.setItem('isMuted', isMuted);
    }, [isMuted]);

    useEffect(() => {
        localStorage.setItem('vibe', vibe);
        document.documentElement.setAttribute('data-vibe', vibe);

        // Trigger notification asynchronously to avoid sync setState in effect lint error
        const notifyTimer = setTimeout(() => setShowNotification(true), 0);
        const timer = setTimeout(() => setShowNotification(false), 3000);

        return () => {
            clearTimeout(notifyTimer);
            clearTimeout(timer);
        };
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
            showNotification
        }}>
            {children}
        </ControlContext.Provider>
    );
};
