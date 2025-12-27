import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wrench,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Cog,
  FolderTree,
  Factory,
} from 'lucide-react';
import { cn } from '../../utils/helpers';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Equipment', href: '/equipment', icon: Cog },
  { name: 'Equipment Categories', href: '/equipment-categories', icon: FolderTree },
  { name: 'Work Centers', href: '/work-centers', icon: Factory },
  { name: 'Maintenance Teams', href: '/teams', icon: Users },
  { name: 'Maintenance Requests', href: '/maintenance', icon: Wrench },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen z-40',
        'bg-dark-900/95 backdrop-blur-xl border-r border-dark-700/50',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-dark-700/50">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center w-full')}>
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-glow-sm">
            <Cog className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-white">GearGuard</h1>
              <p className="text-xs text-gray-500">Maintenance System</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive =
              item.href === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.href);

            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium',
                    'transition-all duration-300',
                    isActive
                      ? 'bg-gradient-to-r from-primary-600/80 to-primary-500/60 text-white shadow-glow-sm'
                      : 'text-gray-400 hover:bg-glass-hover hover:text-white',
                    collapsed && 'justify-center px-2'
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon className={cn(
                    'w-5 h-5 flex-shrink-0 transition-colors',
                    isActive && 'text-white'
                  )} />
                  {!collapsed && <span>{item.name}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className="absolute bottom-4 left-0 right-0 px-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'flex items-center justify-center w-full py-3 text-gray-500',
            'hover:text-white hover:bg-glass-hover rounded-xl transition-all duration-300'
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 mr-2" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
