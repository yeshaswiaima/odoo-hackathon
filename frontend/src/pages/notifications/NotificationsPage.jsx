import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Trash2,
  CheckCheck,
  ExternalLink,
  Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';

export const NotificationsPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.success) {
        setNotifications(res.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
      toast.error('Unable to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      const res = await api.put(`/notifications/${id}/read`);
      if (res.success) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await api.put('/notifications/read-all');
      if (res.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        toast.success('All notifications marked as read.');
      }
    } catch (err) {
      toast.error('Failed to mark all as read.');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/notifications/${id}`);
      if (res.success) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        toast.info('Notification removed.');
      }
    } catch (err) {
      toast.error('Failed to delete notification.');
    }
  };

  // Filter items
  let filtered = notifications;
  if (filter === 'unread') {
    filtered = filtered.filter(n => !n.isRead);
  } else if (filter === 'read') {
    filtered = filtered.filter(n => n.isRead);
  }

  if (typeFilter !== 'all') {
    filtered = filtered.filter(n => (n.type || '').toLowerCase() === typeFilter.toLowerCase());
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-navy">Notification Center</h2>
          <p className="text-xs text-brand-muted mt-0.5">
            System updates, attendance reminders, and workflow status changes.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            icon={CheckCheck}
            onClick={handleMarkAllRead}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filter Tabs & Type Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-brand-border shadow-card">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === 'all'
                ? 'bg-brand-navy text-white'
                : 'text-brand-muted hover:bg-slate-100 hover:text-brand-navy'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === 'unread'
                ? 'bg-brand-blue text-white'
                : 'text-brand-muted hover:bg-slate-100 hover:text-brand-navy'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === 'read'
                ? 'bg-brand-navy text-white'
                : 'text-brand-muted hover:bg-slate-100 hover:text-brand-navy'
            }`}
          >
            Read ({notifications.length - unreadCount})
          </button>
        </div>

        {/* Type Filter */}
        <div className="w-full sm:w-48">
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="py-1.5 text-xs"
          >
            <option value="all">All Alert Types</option>
            <option value="success">Success / Approvals</option>
            <option value="warning">Warnings / Submissions</option>
            <option value="info">General Reminders</option>
            <option value="danger">Errors / Rejections</option>
          </Select>
        </div>
      </div>

      {/* Notifications List */}
      <Card bodyClassName="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton count={5} type="table" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications found"
            description="You are completely caught up! No notifications match the selected filter criteria."
            actionLabel={filter !== 'all' || typeFilter !== 'all' ? 'Reset Filters' : undefined}
            onAction={() => {
              setFilter('all');
              setTypeFilter('all');
            }}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((n) => {
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
                  className={`p-4 sm:p-5 flex items-start gap-4 transition hover:bg-slate-50/80 ${
                    !n.isRead ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${iconBg}`}>
                    <IconComp className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="text-sm font-bold text-brand-navy leading-tight">
                        {n.title}
                      </h4>
                      <span className="text-[11px] text-slate-400 flex-shrink-0">
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                      </span>
                    </div>

                    <p className="text-xs text-brand-muted mt-1 leading-relaxed">{n.message}</p>

                    {n.link && (
                      <div className="mt-2.5">
                        <button
                          onClick={() => {
                            handleMarkRead(n.id);
                            navigate(n.link);
                          }}
                          className="text-xs font-semibold text-brand-blue hover:text-brand-blue-hover inline-flex items-center gap-1"
                        >
                          View Details <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                    {!n.isRead && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="p-1.5 rounded-lg text-brand-blue hover:bg-blue-100/50 transition"
                        title="Mark as read"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default NotificationsPage;
