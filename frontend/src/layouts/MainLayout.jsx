import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-transparent">
      <Sidebar />
      <div className="ml-64 transition-all duration-300">
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
