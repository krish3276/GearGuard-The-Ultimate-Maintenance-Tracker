import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { SidebarProvider, useSidebar } from '../context/SidebarContext';

const MainContent = () => {
  const { isCollapsed } = useSidebar();

  return (
    <div className={`transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
      <main className="min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

const MainLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-transparent">
        <Sidebar />
        {/* Main content - no left margin on mobile, margin on desktop */}
        <MainContent />
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
