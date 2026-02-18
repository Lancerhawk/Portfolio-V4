import { createContext, useContext } from 'react';

export const ControlContext = createContext();

export const useControls = () => {
    const context = useContext(ControlContext);
    if (!context) {
        throw new Error('useControls must be used within a ControlProvider');
    }
    return context;
};
