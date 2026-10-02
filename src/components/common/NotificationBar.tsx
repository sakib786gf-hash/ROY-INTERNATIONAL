import React, { useState } from 'react';
import { Bell, CheckCheck, X, AlertTriangle, CheckCircle2, Info, ChevronRight } from 'lucide-react';
import { NotificationItem } from '../../types';
import { StorageService } from '../../services/storage';

function cleanNotificationText(text: string): string {
  if (!text) return '';
  return text
    .replace(/pending\s*admin\s*review/gi, 'pending verification')
    .replace(/pending\s*admin\s*approval/gi, 'pending verification')
    .replace(/admin\s*review/gi, 'verification')
    .replace(/admin\s*approval/gi, 'verification')
    .replace(/super\s*admin/gi, 'System')
    .replace(/rejected\s*by\s*admin/gi, 'Rejected')
    .replace(/approved\s*by\s*admin/gi, 'Approved')
    .replace(/by\s*admin/gi, '')
    .replace(/admin/gi, '')
    .replace(/এডমিন/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

interface NotificationBarProps {
  notifications: NotificationItem[];
  currentUserId: string;
  onRefresh: () => void;
}

export const NotificationBar: React.FC<NotificationBarProps> = ({
  notifications,
  currentUserId,
  onRefresh,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTopTicker, setShowTopTicker] = useState(true);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const latestNotification = notifications[0];

  const handleMarkAllRead = () => {
    StorageService.markAllNotificationsAsRead(currentUserId);
    onRefresh();
  };

  const handleMarkSingleRead = (id: string) => {
    StorageService.markNotificationAsRead(id);
    onRefresh();
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'warning':
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400 shrink-0" />;
    }
  };

  return (
    <>
      {/* 9: Notification Bar - Top Ticker Banner */}
      {showTopTicker && latestNotification && (
        <div className="w-full bg-gradient-to-r from-slate-900/90 via-cyan-950/80 to-slate-900/90 border-b border-cyan-500/20 px-4 py-2 text-xs backdrop-blur-md flex items-center justify-between z-40 transition-all">
          <div className="flex items-center gap-2 overflow-hidden mr-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] tracking-wider uppercase border border-cyan-500/30 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              LIVE NOTICE
            </span>
            <div className="flex items-center gap-1.5 truncate text-slate-300">
              {getIcon(latestNotification.type)}
              <span className="font-semibold text-white truncate">{cleanNotificationText(latestNotification.title)}:</span>
              <span className="text-slate-300 truncate hidden sm:inline">{cleanNotificationText(latestNotification.message)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 font-medium underline flex items-center gap-0.5 text-[11px] cursor-pointer"
            >
              View All ({notifications.length})
              <ChevronRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => setShowTopTicker(false)}
              className="text-slate-400 hover:text-slate-200 p-0.5 cursor-pointer"
              title="Dismiss notification bar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Bell Drawer / Modal Popover */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden mt-12 sm:mt-14 glass-panel">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Notification Center</h3>
                  <p className="text-xs text-slate-400">
                    {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 transition-all cursor-pointer"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[70vh] overflow-y-auto divide-y divide-slate-800/60">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-50" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleMarkSingleRead(item.id)}
                    className={`p-3.5 hover:bg-slate-800/50 transition-colors cursor-pointer flex gap-3 ${
                      !item.isRead ? 'bg-cyan-950/20 border-l-2 border-l-cyan-400' : ''
                    }`}
                  >
                    <div className="mt-0.5">{getIcon(item.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-xs font-semibold ${!item.isRead ? 'text-white' : 'text-slate-300'}`}>
                          {cleanNotificationText(item.title)}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{cleanNotificationText(item.message)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
