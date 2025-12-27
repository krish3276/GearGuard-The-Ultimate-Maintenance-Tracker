import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { SidebarProvider } from '../context/SidebarContext';

const MainLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-transparent">
        <Sidebar />
        {/* Main content - no left margin on mobile, margin on desktop */}
        <div className="lg:ml-64 transition-all duration-300">
          <main className="min-h-screen">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
