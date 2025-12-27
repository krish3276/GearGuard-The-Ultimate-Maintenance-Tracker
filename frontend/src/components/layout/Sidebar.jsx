import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wrench,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Cog,
  FolderTree,
  Factory,
} from 'lucide-react';
import { cn } from '../../utils/helpers';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  {
    name: 'Equipment',
    href: '/equipment',
    icon: Cog,
    children: [
      { name: 'Equipment', href: '/equipment' },
      { name: 'Work Centers', href: '/work-centers' },
    ]
  },
  { name: 'Maintenance Teams', href: '/teams', icon: Users },
  { name: 'Maintenance Requests', href: '/maintenance', icon: Wrench },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState(['Equipment']);
  const location = useLocation();

  const toggleExpanded = (name) => {
    setExpandedItems(prev =>
      prev.includes(name)
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  const isItemActive = (item) => {
    if (item.children) {
      return item.children.some(child =>
        child.href === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(child.href)
      );
    }
    return item.href === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(item.href);
  };

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
      <nav className="flex-1 py-6 px-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = isItemActive(item);
            const isExpanded = expandedItems.includes(item.name);
            const hasChildren = item.children && item.children.length > 0;

            return (
              <li key={item.name}>
                {hasChildren ? (
                  <>
                    {/* Parent with children */}
                    <button
                      onClick={() => !collapsed && toggleExpanded(item.name)}
                      className={cn(
                        'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium',
                        'transition-all duration-300',
                        isActive
                          ? 'bg-gradient-to-r from-primary-600/80 to-primary-500/60 text-white shadow-glow-sm'
                          : 'text-gray-400 hover:bg-glass-hover hover:text-white',
                        collapsed && 'justify-center px-2'
                      )}
                      title={collapsed ? item.name : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={cn(
                          'w-5 h-5 flex-shrink-0 transition-colors',
                          isActive && 'text-white'
                        )} />
                        {!collapsed && <span>{item.name}</span>}
                      </div>
                      {!collapsed && (
                        <ChevronDown className={cn(
                          'w-4 h-4 transition-transform duration-200',
                          isExpanded && 'rotate-180'
                        )} />
                      )}
                    </button>

                    {/* Children */}
                    {!collapsed && isExpanded && (
                      <ul className="mt-1 ml-4 pl-4 border-l border-dark-700/50 space-y-1">
                        {item.children.map((child) => {
                          const isChildActive = child.href === '/'
                            ? location.pathname === '/'
                            : location.pathname === child.href ||
                            (child.href !== '/equipment' && location.pathname.startsWith(child.href));

                          return (
                            <li key={child.href}>
                              <NavLink
                                to={child.href}
                                className={cn(
                                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                                  'transition-all duration-200',
                                  isChildActive
                                    ? 'bg-primary-500/20 text-primary-400 font-medium'
                                    : 'text-gray-500 hover:text-gray-300 hover:bg-glass-hover'
                                )}
                              >
                                <div className={cn(
                                  'w-1.5 h-1.5 rounded-full',
                                  isChildActive ? 'bg-primary-400' : 'bg-gray-600'
                                )} />
                                {child.name}
                              </NavLink>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </>
                ) : (
                  /* Regular nav item */
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
                )}
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
