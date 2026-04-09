import React, { useState, useEffect, useRef } from 'react';
import { ControlContext } from './ControlContext';

export const ControlProvider = ({ children }) => {
    const [isPhysics, setIsPhysics] = useState(false);
    const [isMuted, setIsMuted] = useState(() => localStorage.getItem('isMuted') === 'true');
    const [vibe, setVibe] = useState(() => localStorage.getItem('vibe') || 'default');
    const [showNotification, setShowNotification] = useState(false);
    const [notificationKey, setNotificationKey] = useState(0);
    const prevVibe = useRef(localStorage.getItem('vibe') || 'default');

    const vibes = ['default', 'neon', 'retro', 'minimal'];

    useEffect(() => {
        localStorage.setItem('isMuted', isMuted);
    }, [isMuted]);

    useEffect(() => {
        localStorage.setItem('vibe', vibe);
        document.documentElement.setAttribute('data-vibe', vibe);

        if (prevVibe.current === vibe) return;
        prevVibe.current = vibe;

        const notifyTimer = setTimeout(() => {
            setNotificationKey(k => k + 1);
            setShowNotification(true);
        }, 0);
        const timer = setTimeout(() => setShowNotification(false), 3100);
        return () => {
            clearTimeout(notifyTimer);
            clearTimeout(timer);
        };
    }, [vibe]);

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
