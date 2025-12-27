import { Bell, Search, LogOut, User, Settings, Check, Trash2, Wrench, AlertTriangle, Info, CheckCircle, Clock } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import Avatar from '../common/Avatar';
import { formatDistanceToNow } from 'date-fns';

const Header = ({ title, subtitle }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const menuRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNotificationIcon = (type, priority) => {
    const iconClass = priority === 'critical' ? 'text-rose-400' :
      priority === 'high' ? 'text-amber-400' :
        priority === 'medium' ? 'text-cyan-400' : 'text-gray-400';

    switch (type) {
      case 'maintenance_due':
      case 'maintenance_overdue':
        return <Clock className={`w-5 h-5 ${iconClass}`} />;
      case 'maintenance_completed':
        return <CheckCircle className={`w-5 h-5 text-emerald-400`} />;
      case 'equipment_alert':
        return <AlertTriangle className={`w-5 h-5 ${iconClass}`} />;
      case 'team_assigned':
        return <Wrench className={`w-5 h-5 ${iconClass}`} />;
      case 'system':
        return <Info className={`w-5 h-5 ${iconClass}`} />;
      default:
        return <Bell className={`w-5 h-5 ${iconClass}`} />;
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      critical: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      high: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      medium: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      low: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    };
    return colors[priority] || colors.medium;
  };

  const formatTime = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700/50">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left Section - Title */}
        <div>
          <h1 className="text-xl font-semibold text-gray-100">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <button className="p-2.5 text-gray-400 hover:text-white hover:bg-glass-hover rounded-xl transition-all duration-300">
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 text-gray-400 hover:text-white hover:bg-glass-hover rounded-xl transition-all duration-300"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-full px-1.5 shadow-lg">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-dark-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-dark-700/50 overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 border-b border-dark-700/50 flex items-center justify-between bg-dark-900/50">
                  <div>
                    <h3 className="font-semibold text-gray-100">Notifications</h3>
                    {unreadCount > 0 && (
                      <p className="text-xs text-gray-500">{unreadCount} unread</p>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 font-medium transition-colors"
                    >
                      <Check className="w-3 h-3" />
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification List */}
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 border-b border-dark-700/30 hover:bg-glass-hover transition-all duration-200 cursor-pointer ${!notification.read ? 'bg-primary-500/5' : ''
                          }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type, notification.priority)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm font-medium ${!notification.read ? 'text-gray-100' : 'text-gray-300'}`}>
                                {notification.title}
                              </p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all duration-200"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-sm text-gray-400 mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityBadge(notification.priority)}`}>
                                {notification.priority}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatTime(notification.createdAt)}
                              </span>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="px-4 py-3 border-t border-dark-700/50 bg-dark-900/50">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                      }}
                      className="w-full text-center text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors"
                    >
                      View all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 hover:bg-glass-hover rounded-xl transition-all duration-300"
            >
              <Avatar name={user?.name} size="sm" />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-100">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-dark-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-dark-700/50 py-2 overflow-hidden">
                <div className="px-4 py-3 border-b border-dark-700/50">
                  <p className="text-sm font-medium text-gray-100">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/profile');
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-glass-hover transition-all duration-200"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-glass-hover transition-all duration-200">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                </div>
                <div className="border-t border-dark-700/50 pt-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
