import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Menu, LogOut } from 'lucide-react';
import { NotificationBell } from './NotificationBell';

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const email = user?.email ?? '';
  const initials = email.charAt(0).toUpperCase() || '?';

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-cream-200 bg-cream-50/90 px-4 py-3.5 backdrop-blur-md lg:px-8">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-ink-600 hover:bg-cream-200 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden lg:block">
        <p className="text-sm text-ink-400">
          Welcome to PAWCARE — your pet's health companion
        </p>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />
        <div className="flex items-center gap-2.5 rounded-xl border border-cream-200 bg-white px-3 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage-100 text-sm font-semibold text-sage-700">
            {initials}
          </div>
          <div className="hidden sm:block max-w-[160px]">
            <p className="truncate text-sm font-medium text-ink-800">{email || 'User'}</p>
            <p className="text-xs text-ink-400">Signed in</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-red-50 hover:text-red-600"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
