import { NavLink } from 'react-router-dom';
import { PawPrint, X } from 'lucide-react';
import { navItems } from '@/lib/navigation';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink-900/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-72 flex-col border-r border-cream-200 bg-cream-50 transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <NavLink to="/app/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-600 text-white">
              <PawPrint className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-ink-900">PAWCARE</h1>
              <p className="text-xs text-ink-400">Pet Health Manager</p>
            </div>
          </NavLink>
          <button onClick={onClose} className="rounded-lg p-2 text-ink-500 hover:bg-cream-200 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-sage-600 text-white shadow-soft'
                    : 'text-ink-600 hover:bg-cream-200 hover:text-ink-900'
                }`
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-cream-200 px-6 py-4">
          <div className="rounded-xl bg-sage-50 px-4 py-3">
            <p className="text-xs font-medium text-sage-700">PAWCARE Preview</p>
            <p className="mt-1 text-xs text-ink-400">
              Foundation build — sample data shown for layout purposes.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
