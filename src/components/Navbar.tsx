import { Clapperboard, LogOut, Search, ListVideo, BarChart3, LogIn } from 'lucide-react';
import type { AppUser } from '../types/media';

export type View = 'discover' | 'watchlist' | 'stats';

interface Props {
  view: View;
  onViewChange: (v: View) => void;
  user: AppUser | null;
  onSignInClick: () => void;
  onSignOut: () => void;
  listCount: number;
}

const TABS: { id: View; label: string; icon: typeof Search }[] = [
  { id: 'discover', label: 'Discover', icon: Search },
  { id: 'watchlist', label: 'Watchlist', icon: ListVideo },
  { id: 'stats', label: 'Insights', icon: BarChart3 },
];

export default function Navbar({ view, onViewChange, user, onSignInClick, onSignOut, listCount }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-ink-950/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <a href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight" aria-label="CinePulse home">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-pulse-400 to-pulse-600 text-white shadow-lg shadow-pulse-500/30">
            <Clapperboard size={18} />
          </span>
          <span className="hidden sm:inline">Cine<span className="text-pulse-400">Pulse</span></span>
        </a>

        <nav aria-label="Primary" className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              aria-current={view === id ? 'page' : undefined}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                view === id ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={16} /> {label}
              {id === 'watchlist' && listCount > 0 && (
                <span className="rounded-full bg-pulse-500/20 px-2 text-xs text-pulse-400">{listCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden text-right text-xs leading-tight sm:block">
                <p className="font-semibold text-white">{user.name}</p>
                <p className="text-slate-500">{user.isGuest ? 'Guest demo' : user.email}</p>
              </div>
              <button className="btn-ghost" onClick={onSignOut} aria-label="Sign out"><LogOut size={16} /></button>
            </>
          ) : (
            <button className="btn-primary" onClick={onSignInClick}><LogIn size={16} /> Sign in</button>
          )}
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <nav aria-label="Primary mobile" className="glass fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-x-0 border-b-0 md:hidden">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            aria-current={view === id ? 'page' : undefined}
            className={`flex flex-col items-center gap-1 py-3 text-xs font-medium ${view === id ? 'text-pulse-400' : 'text-slate-400'}`}
          >
            <Icon size={20} /> {label}
          </button>
        ))}
      </nav>
    </header>
  );
}
