import { createContext, useContext, useState } from 'react';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggle = () => setIsOpen(!isOpen);
    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);
    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    return (
        <SidebarContext.Provider value={{ isOpen, toggle, open, close, isCollapsed, toggleCollapse }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};

export default SidebarContext;
