import db from '../config/db.js';

export const getUserNotifications = (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = db.table('notifications').find(n => n.userId === userId);

    // Sort newest first
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications
    });
  } catch (err) {
    console.error('Get notifications error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve notifications.' });
  }
};

export const markAsRead = (req, res) => {
  try {
    const { id } = req.params;
    const notification = db.table('notifications').findById(Number(id));

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    if (notification.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const updated = db.table('notifications').update(notification.id, { isRead: true });

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      notification: updated
    });
  } catch (err) {
    console.error('Mark notification read error:', err);
    return res.status(500).json({ success: false, message: 'Failed to mark notification as read.' });
  }
};

export const markAllAsRead = (req, res) => {
  try {
    const userId = req.user.id;
    const userNotifs = db.table('notifications').find(n => n.userId === userId && !n.isRead);

    userNotifs.forEach(notif => {
      db.table('notifications').update(notif.id, { isRead: true });
    });

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (err) {
    console.error('Mark all read error:', err);
    return res.status(500).json({ success: false, message: 'Failed to mark all as read.' });
  }
};

export const deleteNotification = (req, res) => {
  try {
    const { id } = req.params;
    const notification = db.table('notifications').findById(Number(id));

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    if (notification.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    db.table('notifications').delete(notification.id);

    return res.status(200).json({
      success: true,
      message: 'Notification deleted.'
    });
  } catch (err) {
    console.error('Delete notification error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete notification.' });
  }
};
