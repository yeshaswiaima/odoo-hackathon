import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  LogOut,
  User,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const Header = ({ onOpenSidebar, title = 'Dashboard', subtitle }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(prev - 1, 0));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-8 bg-white/95 backdrop-blur-md border-b border-brand-border">
      {/* Left: Mobile Toggle & Page Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-lg text-brand-muted hover:text-brand-navy hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-brand-navy leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-brand-muted hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      {/* Right: Notification dropdown + User Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-brand-muted hover:text-brand-navy hover:bg-slate-100 transition"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-brand-blue rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Notifications Popover */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-dropdown border border-brand-border z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 text-brand-blue rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-brand-blue hover:text-brand-blue-hover font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-brand-muted">
                    No notifications right now.
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n) => {
                    let IconComp = Info;
                    let iconBg = 'bg-blue-50 text-brand-blue';
                    if (n.type === 'success') {
                      IconComp = CheckCircle2;
                      iconBg = 'bg-emerald-50 text-brand-success';
                    } else if (n.type === 'warning') {
                      IconComp = AlertTriangle;
                      iconBg = 'bg-amber-50 text-brand-warning';
                    } else if (n.type === 'danger' || n.type === 'error') {
                      IconComp = AlertCircle;
                      iconBg = 'bg-rose-50 text-brand-danger';
                    }

                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          if (n.link) navigate(n.link);
                          setShowNotifications(false);
                        }}
                        className={`p-3.5 flex items-start gap-3 hover:bg-slate-50/80 cursor-pointer transition ${
                          !n.isRead ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${iconBg}`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-brand-navy leading-tight">{n.title}</p>
                          <p className="text-[11px] text-brand-muted mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                          </span>
                        </div>
                        {!n.isRead && (
                          <button
                            onClick={(e) => handleMarkAsRead(n.id, e)}
                            title="Mark as read"
                            className="w-2 h-2 rounded-full bg-brand-blue mt-1.5 hover:scale-125 transition"
                          />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-2 border-t border-brand-border bg-slate-50/50 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-medium text-brand-blue hover:text-brand-blue-hover flex items-center justify-center gap-1 py-1"
                >
                  View All Notifications <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar & Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1 pl-2 rounded-full hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
          >
            <img
              src={user?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`}
              alt={user?.name || 'Avatar'}
              className="w-8 h-8 rounded-full bg-slate-200 object-cover border border-slate-200"
            />
            <div className="text-left hidden md:block">
              <span className="block text-xs font-bold text-brand-navy leading-none">{user?.name || 'Priya Sharma'}</span>
              <span className="block text-[10px] text-brand-muted mt-0.5">{isAdmin ? 'Admin / HR' : 'Employee'}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-brand-muted hidden sm:block" />
          </button>

          {/* User Menu Popover */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-dropdown border border-brand-border z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-brand-border bg-slate-50/50">
                <p className="text-xs font-semibold text-brand-navy truncate">{user?.name}</p>
                <p className="text-[11px] text-brand-muted truncate mt-0.5">{user?.email}</p>
                <span className="inline-block mt-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-50 text-brand-blue rounded-md">
                  ID: {user?.employeeId || 'DF-001'}
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    navigate(isAdmin ? '/profile' : '/profile');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-brand-navy hover:bg-slate-50 flex items-center gap-2.5 transition"
                >
                  <User className="w-4 h-4 text-brand-muted" />
                  <span>My Profile</span>
                </button>
              </div>

              <div className="border-t border-brand-border py-1">
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
