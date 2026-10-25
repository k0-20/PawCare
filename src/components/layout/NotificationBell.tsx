import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCircle2, Trash2, CheckCheck, BellOff } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { type NotificationType } from '@/types';

const typeIconColor: Record<NotificationType, string> = {
  health_alert: 'bg-red-100 text-red-600',
  care_reminder: 'bg-amber-100 text-amber-600',
  system: 'bg-blue-100 text-blue-600',
  info: 'bg-sage-100 text-sage-600',
};

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, loading } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative rounded-lg p-2 text-ink-500 transition-colors hover:bg-cream-200 hover:text-ink-900"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-lg animate-fade-in sm:w-96">
          <div className="flex items-center justify-between border-b border-cream-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-ink-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs font-medium text-sage-600 transition-colors hover:text-sage-700"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto scrollbar-thin">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-sage-200 border-t-sage-600" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <BellOff className="mb-2 h-7 w-7 text-ink-300" />
                <p className="text-sm text-ink-400">No notifications yet</p>
                <p className="mt-1 text-xs text-ink-400">
                  Care reminders will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-cream-100">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-cream-50 ${
                      !notif.is_read ? 'bg-sage-50/50' : ''
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        typeIconColor[notif.type] ?? typeIconColor.info
                      }`}
                    >
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-900">{notif.title}</p>
                      <p className="mt-0.5 text-xs text-ink-500">{notif.message}</p>
                      <p className="mt-1 text-xs text-ink-400">
                        {new Date(notif.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      {!notif.is_read && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-sage-100 hover:text-sage-600"
                          title="Mark as read"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notif.id)}
                        className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-cream-200 px-4 py-2.5">
              <Link
                to="/app/settings"
                onClick={() => setOpen(false)}
                className="block text-center text-xs font-medium text-sage-600 transition-colors hover:text-sage-700"
              >
                Manage notification settings
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
